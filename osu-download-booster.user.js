// ==UserScript==
// @name         Osu Download Booster
// @namespace    https://www.rainng.com/
// @version      1.1
// @description  Osu谱面下载加速, 为中国玩家打造, 使用Rainng的镜像, 由Azure99维护
// @author       Azure99
// @homepage     https://www.rainng.com/osu-download-booster
// @downloadURL  https://www.rainng.com/ser/download/osu-download-booster.user.js
// @supportURL   https://github.com/Azure99/osu-download-booster/issues
// @icon         https://osu.ppy.sh/favicon.ico
// @include      http*://osu.ppy.sh/*
// @grant        GM_xmlhttpRequest
// @connect      bm4.ppy.sh
// @connect      bm5.ppy.sh
// @connect      bm6.ppy.sh
// @connect      bm7.ppy.sh
// @connect      bm8.ppy.sh
// ==/UserScript==

(function () {
    'use strict';
    let lastId = -1;
    let latestDownloadUrl = '';
    let running = false;

    setBeatmapTimer();
    setButtonTimer();

    function setBeatmapTimer() {
        setInterval(function () {
            checkBeatmapId();
        }, 500);
    }

    function setButtonTimer() {
        setInterval(function () {
            insertButton();
            updateButton();
        }, 100);
    }

    function checkBeatmapId() {
        let currentId = getBeatmapId();
        if (lastId !== currentId) {
            lastId = currentId;
            if (currentId > 0) {
                getDownloadUrl(currentId);
            }
        }
    }

    function insertButton() {
        let needInsert = $('.js-beatmapset-download-link').length >= 1 && $('.btn-osu-mirror').length === 0;
        if (needInsert) {
            $('.beatmapset-header__buttons').append(
                '<a href="' + latestDownloadUrl + '" data-turbolinks="false"\n' +
                '   class="btn-osu-mirror btn-osu-big btn-osu-big--beatmapset-header js-beatmapset-download-link"><span\n' +
                '        class="btn-osu-big__content "><span class="btn-osu-big__left"><span class="btn-osu-big__text-top">镜像下载</span><span\n' +
                '        class="btn-osu-hint btn-osu-big__text-bottom">获取地址中...</span></span><span class="btn-osu-big__icon"><span class="fa-fw"><i\n' +
                '        class="fas fa-download"></i></span></span></span></a>'
            )
        }
    }

    function updateButton() {
        let btn = $('.btn-osu-mirror')[0];
        if (btn && btn.href !== latestDownloadUrl) {
            btn.href = latestDownloadUrl;
            if (btn.href.startsWith("http://")) {
                $('.btn-osu-hint')[0].innerText = '由Azure99加速';
            } else {
                $('.btn-osu-hint')[0].innerText = '获取地址中...';
            }
        }
    }

    function getBeatmapId() {
        let url = window.location.pathname;
        if (url.startsWith('/beatmapsets/')) {
            let id = parseInt(url.substring(13, url.length));
            if (typeof (id) == 'number' && id > 0) {
                return id;
            }
        }
        return -1;
    }

    function getDownloadUrl(mapId) {
        if (running) {
            return;
        }
        running = true;
        latestDownloadUrl = '';
        let request = GM_xmlhttpRequest({
            method: 'GET',
            url: '/beatmapsets/' + mapId + '/download',
            onreadystatechange: function (status) {
                let url = status.finalUrl.toString();
                if (url.startsWith("https://bm") && status.readyState === 2) {
                    running = false;
                    request.abort();
                    latestDownloadUrl = url.replace("https://", "http://").replace(".ppy.sh/", ".osu.rainng.com/");
                }
            }
        });
    }
})();
