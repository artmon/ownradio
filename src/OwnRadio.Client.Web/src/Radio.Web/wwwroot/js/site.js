$(function () {
    // Facebook adds hash after login
    // See http://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
    if (window.location.hash && window.location.hash == '#_=_') {
        history.pushState("", document.title, window.location.pathname);
    }

    var logoutContainer = $('#logout');
    $('#logout-trigger').click(function (event) {
        event.preventDefault();

        logoutContainer.toggle();
    });

    var currentTrackData = {
        userId: $('#userGuid').val(),
        lastTrackId : -1,
        lastTrackMethod: '',
        listedTillTheEnd: false
    };

    var baseUrl = "http://ownradio.ru/api/track/";
    var lastBaseUrl = "http://radio.redoc.ru/api/TrackSource/"; 
    var userInteracted = false;
    var isMobile = false;
    var stalledTime = 0;

    var skipButton = $('#player-skip');
    var playButton = $('#player-play');
    var pauseButton = $('#player-pause');
    var muteButton = $('#player-mute');
    var soundButton = $('#player-sound');

    var timeLabel = $('#player-time');
    var loadProgress = $('#load-progress');
    var playerProgress = $('#player-progress');

    var soundProgressContainer = $('#sound-progress-container');
    var soundProgress = $('#sound-progress');

    var audio = document.getElementById('audio');
    var audioSource = document.getElementById('audio-source');
    var audioLocked = false;

    skipButton.click(function() {
        if (audioLocked) {
            return;
        }

        audioLocked = true;

        if (audio.currentTime > 0) {
            audio.pause();
            setTrackStatus(false);
        } else {
            loadNextTrack();
        }
    });

    playButton.click(function () {
        if (audioLocked) {
            return;
        }

        audioLocked = true;

        playButton.toggleClass('hidden');
        pauseButton.toggleClass('hidden');
        userInteracted = true;

        if (audio.currentTime > 0) {
            console.log(audio.duration);
            if (stalledTime > 0) {
                audio.load();
                audio.play().then(function () {
                    audioLocked = false;
                    audio.currentTime = stalledTime;
                    stalledTime = 0;
                });
            } else {
                audio.play().then(function () {
                    audioLocked = false;
                });
            }

            return;
        }

        playStream(currentTrackData);
    });

    pauseButton.click(function () {
        if (audioLocked) {
            return;
        }

        playButton.toggleClass('hidden');
        pauseButton.toggleClass('hidden');
        audio.pause();
    });

    muteButton.click(function () {
        audio.volume = 0;
        soundProgress.width(0);
    });

    soundProgressContainer.click(function (e) {
        audio.volume = e.offsetX / $(this).width();
        soundProgress.width(audio.volume * 100 + '%');
    });

    soundButton.click(function () {
        audio.volume = 1;
        soundProgress.width('100%');
    });


    function loadNextTrack() {

        //Не работют ajax запросы на этот сервер, не работает прием ответа
        var url = baseUrl + "GetNextTrackID/" + $('#userGuid').val();
        $.ajax({
            url: lastBaseUrl + "NextTrack",
            method: "GET",
            data: currentTrackData,
            error: function(jqXHR, textStatus, errorThrown) {
                if (typeof errorThrown != 'undefined' && typeof errorThrown.message != 'undefined')
                    alert(errorThrown.message);
                else
                    alert(textStatus);
            },
            }).done(playStream).fail(alert);
    }

    function playStream(trackData) {

        if (trackData.TrackId) {
            currentTrackData.lastTrackId = trackData.TrackId;
            currentTrackData.lastTrackMethod = trackData.Method;
        } 

        //запустить с нового сервиса
        var url = baseUrl + "GetTrackByID/e923cf97-009e-4d9d-9b70-f793ac2b9006";

        url = lastBaseUrl + "Play?" + $.param({ trackId: currentTrackData.lastTrackId });

        audioSource.src = url;
        audio.ontimeupdate = audioProgress;

        audio.onended = function () {
            setTrackStatus(true);
        }

        audio.onstalled = function () {
            if (!audio.paused) {
                stalledTime = audio.currentTime;
                pauseButton.click();
            }
        };

        if (!isMobile) {
            userInteracted = true;
        }

        if (userInteracted) {
            playButton.addClass('hidden');
            pauseButton.removeClass('hidden');

            audio.load();
            audio.play().then(function () {
                audioLocked = false;
            });
        }

    };

    //function setTrackStatus(status) {
    //    currentTrackData.listedTillTheEnd = status;
    //    $.ajax({
    //        url: baseUrl + "UpdateStatistic",
    //        method: "GET",
    //        data: currentTrackData,
    //    }).done(function () {
    //        audioSource.src = '';
    //        timeLabel.text('0:00');
    //        playerProgress.width(0);
    //        loadProgress.width(0);

    //        loadNextTrack();
    //    }).fail(alert);
    //}

    function setTrackStatus(status) {
        currentTrackData.listedTillTheEnd = status;
        loadNextTrack();
    }

    function audioProgress() {
        if (this.buffered.length == 0) {
            return;
        }

        var progress = audio.currentTime / audio.duration * 100;
        var loadedProgress = this.buffered.end(0) / this.duration * 100;
        var timeLeft = {
            min: Math.floor((audio.duration - audio.currentTime) / 60),
            sec: Math.floor((audio.duration - audio.currentTime) % 60)
        }

        if (isNaN(timeLeft.sec)) {
            return;
        }

        var separator = timeLeft.sec >= 10 ? ':' : ':0';
        var timeString = '-' + timeLeft.min + separator + timeLeft.sec;

        timeLabel.text(timeString);
        playerProgress.width(progress + '%');
        loadProgress.width(loadedProgress + '%');
    }

    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            isMobile = true;
            $('.sound-controls').css({ opacity: 0 });
        }
    })(navigator.userAgent || navigator.vendor || window.opera);

    loadNextTrack();
})