(function($) {
    'use strict';
    $(function() {
        var todoListItem = $('.todo-list');
        var todoListInput = $('.todo-list-input');

        // 입력 필드에서 Enter 키를 눌렀을 때 추가 버튼과 동일한 동작을 수행
        todoListInput.keypress(function(event) {
            if (event.which === 13) { // Enter 키의 keyCode는 13입니다
                event.preventDefault();
                $('.add').click();
            }
        });

        $('.add').on("click", function(event) {
            event.preventDefault();

            var item = $(this).prevAll('.todo-list-input').val();

            if (item) {
                console.log("send '%s' to Server", item)
                // 서버에 전송
                $.post("/todos", {name:item}, addItem)
                todoListInput.val("");
            }
        });

        var addItem = function(item) {
            var createdAt = new Date(item.created_at); // 날짜 문자열을 Date 객체로 변환
            var formattedDate = createdAt.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });

            var listItem = $('<li id="' + item.id + '" class="' + (item.completed ? 'completed' : '') + '"><div class="d-flex justify-content-between align-items-center"><div class="form-check"><label class="form-check-label"><input class="checkbox" type="checkbox"' + (item.completed ? ' checked' : '') + ' />' + item.name + '</label></div></div><span class="createdAt text-muted ml-auto">' + formattedDate + '</span></li>');

            // 리스트 최상단에 항목 추가
            todoListItem.prepend(listItem);

            listItem.find('.checkbox').on('change', function() {
                var id = listItem.attr('id');
                var complete = $(this).prop('checked');

                $.get("/complete-todo/" + id + "?complete=" + complete, function(data) {
                    listItem.toggleClass('completed', complete);
                });

                updateDeleteSelectedVisibility(); // 체크박스 상태 변화로 인해 선택 삭제 버튼의 표시 여부 업데이트
            });

            updateDeleteSelectedVisibility(); // 추가된 항목으로 인해 선택 삭제 버튼의 표시 여부 업데이트
        };

        $.get('/todos', function(items) {
            items.forEach(e => {
                addItem(e);
            });
        });

        function deleteItem(id) {
            $.ajax({
                url: "/todos/" + id,
                type: "DELETE",
                success: function(data) {
                    if (data.success) {
                        $('#' + id).remove();
                        console.log("Todo item deleted successfully");
                        updateDeleteSelectedVisibility(); // 삭제로 인해 선택 삭제 버튼의 표시 여부 업데이트
                    }
                }
            });
        }

        // 선택 삭제 버튼 클릭 시 체크된 항목 모두 삭제
        $('.delete-selected').on('click', function() {
            $('.todo-list .checkbox:checked').each(function() {
                var id = $(this).closest('li').attr('id');
                deleteItem(id);
            });
        });

        // 선택 삭제 버튼의 표시 여부 업데이트 함수
        function updateDeleteSelectedVisibility() {
            var anyChecked = $('.todo-list .checkbox:checked').length > 0;
            $('.delete-selected').toggleClass('d-none', !anyChecked); // 체크된 항목이 있으면 선택 삭제 버튼 표시, 아니면 숨김
        }

        // 정렬 함수
        function sortItems(compareFunction) {
            var items = $('.todo-list li').get();
            items.sort(compareFunction);
            $.each(items, function(idx, itm) {
                todoListItem.append(itm); // 정렬된 순서로 다시 추가
            });
        }

        // 시간순 정렬 버튼
        $('#sort-time').on('click', function() {
            sortItems(function(a, b) {
                return new Date($(a).find('.created_at').text()) - new Date($(b).find('.created_at').text());
            });
        });

        // 가나다순 정렬 버튼
        $('#sort-alpha').on('click', function() {
            sortItems(function(a, b) {
                return $(a).find('.form-check-label').text().localeCompare($(b).find('.form-check-label').text());
            });
        });

        // 페이지가 로드될 때 사용자 정보를 불러와서 설정
        $(document).ready(function() {
            $.get("/auth/userinfo", function(data) {
                $("#username").text(data.username);
            });
        });

    });
})(jQuery);
