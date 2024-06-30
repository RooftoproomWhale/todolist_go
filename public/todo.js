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
                console.log("send '%s' to Server", item)
                // 서버에 전송
                $.post("/todos", {name: item}, function(response) {
                    addItem(response);
                    todoListInput.val("");
                }).fail(function() {
                    alert("서버에 데이터를 전송하는 데 문제가 발생했습니다.");
                });
            }
        });

        var addItem = function(item) {
            var createdAt = new Date(item.created_at); // 날짜 문자열을 Date 객체로 변환
            var formattedDate = createdAt.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            var listItem = $('<li class="' + (item.completed ? 'completed' : '') + '"><div class="form-check"><label class="form-check-label"><input class="checkbox" type="checkbox"' + (item.completed ? ' checked' : '') + '/> ' + item.name + ' <span class="created-at">' + formattedDate + '</span></label></div><i class="remove fa fa-trash"></i></li>');
            todoListItem.prepend(listItem);
            listItem.find('.checkbox').on("change", function() {
                var isChecked = $(this).prop('checked');
                var listItem = $(this).closest('li');
                listItem.toggleClass('completed', isChecked);
                $.ajax({
                    url: "/todos/" + listItem.attr('id'),
                    type: 'PUT',
                    data: {completed: isChecked}
                });
            });
            listItem.find('.remove').on("click", function() {
                var listItem = $(this).closest('li');
                $.ajax({
                    url: "/todos/" + listItem.attr('id'),
                    type: 'DELETE',
                    success: function() {
                        listItem.remove();
                    }
                });
            });
        };

        $.get("/todos", function(items) {
            items.forEach(function(item) {
                addItem(item);
            });
        });

        // 시간순 정렬
        $('#sort-time').on('click', function() {
            var sortedItems = todoListItem.children('li').get().sort(function(a, b) {
                var dateA = new Date($(a).find('.created-at').text());
                var dateB = new Date($(b).find('.created-at').text());
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
    });
})(jQuery);