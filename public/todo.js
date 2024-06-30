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

            var item = todoListInput.val();

            if (item) {
                console.log("send '%s' to Server", item);
                // 서버에 전송
                $.post("/todos", { name: item }, function(response) {
                    addItem(response); // 추가된 아이템을 화면에 추가
                    todoListInput.val(""); // 입력 필드 비우기
                }).fail(function() {
                    alert("서버에 데이터를 전송하는 데 문제가 발생했습니다.");
                });
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

            var listItem = $('<li id="' + item.id + '" class="' + (item.completed ? 'completed' : '') + '"><div class="d-flex justify-content-between align-items-center"><div class="form-check"><label class="form-check-label"><input class="checkbox" type="checkbox"' + (item.completed ? ' checked' : '') + ' />' + item.name + '</label></div><span class="createdAt text-muted ml-auto">' + formattedDate + '</span></div></li>');

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
            items.forEach(function(item) {
                addItem(item);
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

        function parseDate(dateStr) {
            var parts = dateStr.match(/(\d{4})\.\s(\d{2})\.\s(\d{2})\.\s(오전|오후)\s(\d{2}):(\d{2}):(\d{2})/);
            var year = parseInt(parts[1], 10);
            var month = parseInt(parts[2], 10) - 1; // 월은 0부터 시작합니다.
            var day = parseInt(parts[3], 10);
            var hour = parseInt(parts[5], 10);
            var minute = parseInt(parts[6], 10);
            var second = parseInt(parts[7], 10);
            if (parts[4] === '오후' && hour < 12) {
                hour += 12;
            }
            if (parts[4] === '오전' && hour === 12) {
                hour = 0;
            }
            return new Date(year, month, day, hour, minute, second);
        }

        // 시간순 정렬
        $('#sort-time').on('click', function() {
            var sortedItems = todoListItem.children('li').get().sort(function(a, b) {
                var dateA = parseDate($(a).find('.created-at').text());
                var dateB = parseDate($(b).find('.created-at').text());
                return dateA - dateB;
            });
            $.each(sortedItems, function(idx, item) {
                todoListItem.append(item);
            });
        });

        // 가나다순 정렬
        $('#sort-alpha').on('click', function() {
            var sortedItems = todoListItem.children('li').get().sort(function(a, b) {
                var nameA = $(a).find('.form-check-label').text().toUpperCase();
                var nameB = $(b).find('.form-check-label').text().toUpperCase();
                return nameA.localeCompare(nameB);
            });
            $.each(sortedItems, function(idx, item) {
                todoListItem.append(item);
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
