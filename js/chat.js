$(function () {
    var userLogin = "";

    // Выход
    $('#logout').click(function (event) {
        var login = $('#user-login').html();
        $.ajax({
            type: "POST",
            url: 'logout.php',
            data: ({login: login}),
            success: function (msg) {
                if (msg == 1) {
                    document.location.href = '/index.php';
                }
            }
        });
    });

    /*
     * CHAT
     */
    //Обновление списка channels
    //setInterval(channels, 1000);
    var CHANNELS = '';
    var MESSAGES = '';
    var CURRENT_TITLE = '';
    var TIMER_DATA = null;

    if (parts = String(document.location).split("?", 2)[1]) {
        var parts = String(document.location).split("?", 2)[1].split("&");
        var vars = parts[0].split('=');
        var name = vars[0];
        if (name == 'title') {
            var title = vars[1];
            if (title) {
                CURRENT_TITLE = title;
                openChannel(title);
            }
        }
    }

    function openChannel(title) {
        $.ajax({
            type: "POST",
            url: '/chat/openChannel.php',
            data: ({title: title}),
            success: function (msg) {
                if (msg) {
                    CURRENT_TITLE = title;
                    $('#room h2').html(title);
                    var stateParameters = {url: ''};
                    history.pushState(stateParameters, "", '/chat.php?title=' + title); // меняем адрес
                } else {
                    alert("Ошибка открытия Channel");
                }
            }
        });
    }

    function getData() {
        if (TIMER_DATA) {
            clearInterval(TIMER_DATA);
        }
        var title = CURRENT_TITLE;
        if (!title)
            title = $('#room .top h2').html();

        $.ajax({
            type: "POST",
            url: '/chat/getData.php',
            data: ({title: title}),
            dataType: "json",
            success: function (data) {
                $.each(data, function (i, val) {
                    if (i == 'channels') {
                        CHANNELS = val;
                        $('#channels').html(CHANNELS);
                        initChannels();
                    } else if (i == 'messages') {
                        MESSAGES = val;
                        $('#room .messages').html(MESSAGES);
                    }
                    else if (i == 'rss') {
                        RSS = val;
                        $('#rss-list').html(RSS);
                    }
                });
                TIMER_DATA = setInterval(getData, 1000);
            }
        });
    }
    TIMER_DATA = setInterval(getData, 1000);

    // Add channel
    $('#add-channel').click(function (event) {
        addChannel();
    });

    function addChannel() {
        var title = $('#channel-block input[name="title"]').val();

        if (title.length == 0) {
            alert("Название не может быть пустым");
        } else {
            $.ajax({
                type: "POST",
                url: '/chat/addChannel.php',
                data: ({title: title}),
                success: function (msg) {
                    if (msg == 1) {
                        alert('Channel успешно добавлен');
                    } else if (msg == 2) {
                        alert("Channel с таким названием уже существует");
                    } else if (msg == 9) {
                        alert("Неверно введено название");
                    }
                }
            });

        }
    }

    function initChannels() {
        $('#channels a').each(function () {
            $(this).click(function (event) {
                openChannel($(this).html());
            });
        });
    }

    // Add message
    $('#newMessage-button').click(function (event) {
        addMessage();
    });

    function addMessage() {
        var login = $('#user-login').html();
        var message = $('#newMessage').val();
        var title = $('#room .top h2').html();

        if (message.length == 0) {
            alert("Сообщение не может быть пустым");
        } else {
            $.ajax({
                type: "POST",
                url: '/chat/addMessage.php',
                data: ({message: message, login: login, title: title}),
                success: function (msg) {
                    if (msg == 1) {
                        /*alert('Сообщение успешно отправленно');*/
                        $('#newMessage').val('');
                    } else if (msg == 9) {
                        alert("Сообщение введено название");
                    }
                }
            });

        }
    }

    // Add RSS
    $('#add-rss').click(function (event) {
        addRss();
    });

    function addRss() {
        var urlRss = $('.services input[name="rss"]').val();
        var title = $('#room .top h2').html();

        if (urlRss.length == 0) {
            alert("RSS не может быть пустым");
        } else {
            $.ajax({
                type: "POST",
                url: '/chat/svAddRSS.php',
                data: ({urlRss: urlRss, title: title}),
                success: function (msg) {
                    if (msg == 1) {
                        alert('RSS успешно добавлен');
                        $('.services input[name="rss"]').val('');
                    } else if (msg == 2) {
                        alert("Такой RSS уже есть");
                    } else if (msg == 0) {
                        alert("Не правильно указан RSS");
                    }
                }
            });

        }
    }



}); 