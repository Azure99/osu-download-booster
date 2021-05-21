// ==UserScript==
// @name         Osu Download Booster
// @namespace    https://www.rainng.com/
// @version      2.2
// @description  Osu谱面下载加速, 为中国玩家打造, 支持Rainng(Azure99维护)、Sayo(小夜维护)以及chimu的镜像
// @author       Azure99 & SpaceSkyNet
// @homepage     https://www.rainng.com/osu-download-booster
// @supportURL   https://www.rainng.com/osu-download-booster
// @icon         https://osu.ppy.sh/favicon.ico
// @include      http*://osu.ppy.sh/*
// @grant        GM_xmlhttpRequest
// @connect      bm4.ppy.sh
// @connect      bm5.ppy.sh
// @connect      bm6.ppy.sh
// @connect      bm7.ppy.sh
// @connect      bm8.ppy.sh
// @connect      api.chimu.moe
// @connect      ipfs.chimu.moe
// @license      MIT License
// ==/UserScript==

(function () {
    'use strict';
    const SAYO_URL = 'https://txy1.sayobot.cn/beatmaps/download/full/';

    let lastId = -1;
    let Azure99_latestDownloadUrl = '';
    let chimu_latestDownloadUrl = '';
    let Azure99_running = false;
    let chimu_running = false;
    let Azure99_reponseString = '';
    let chimu_reponseString = '';

    setBeatmapTimer();
    setButtonTimer();

    injectGoogleAnalytics();

    function injectGoogleAnalytics() {
        let script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-61W3GZ0ZNP';
        document.body.appendChild(script);

        script = document.createElement('script');
        script.innerHTML = "window.dataLayer = window.dataLayer || [];\n" +
            "function gtag(){dataLayer.push(arguments);}\n" +
            "gtag('js', new Date());\n" +
            "gtag('config', 'G-61W3GZ0ZNP');";
        document.body.appendChild(script)
    }

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
                getAzure99DownloadUrl(currentId);
                getChimuDownloadUrl(currentId);
            }
        }
    }

    function insertButton() {
        let needInsert = $('.js-beatmapset-download-link').length >= 0 && $('.btn-osu-mirror-Azure99').length === 0;
        if (needInsert) {
            $('.beatmapset-header__buttons').append(
                '<a href="' + Azure99_latestDownloadUrl + '" data-turbolinks="false"\n' +
                '   class="btn-osu-mirror-Azure99 btn-osu-big btn-osu-big--beatmapset-header js-beatmapset-download-link"><span\n' +
                '        class="btn-osu-big__content "><span class="btn-osu-big__left"><span class="btn-osu-big__text-top">镜像下载</span><span\n' +
                '        class="btn-osu-hint btn-osu-big__text-bottom">获取地址中...</span></span><span class="btn-osu-big__icon"><span class="fa-fw"><i\n' +
                '        class="fas fa-download"></i></span></span></span></a>'
            );
            $('.beatmapset-header__buttons').append(
                '<a href="' + SAYO_URL + getBeatmapId() + '" data-turbolinks="false"\n' +
                '   class="btn-osu-mirror-sayo btn-osu-big btn-osu-big--beatmapset-header js-beatmapset-download-link"><span\n' +
                '        class="btn-osu-big__content "><span class="btn-osu-big__left"><span class="btn-osu-big__text-top">镜像下载</span><span\n' +
                '        class="btn-osu-hint btn-osu-big__text-bottom">由Sayo加速</span></span><span class="btn-osu-big__icon"><span class="fa-fw"><i\n' +
                '        class="fas fa-download"></i></span></span></span></a>'
            );
            $('.beatmapset-header__buttons').append(
                '<a href="' + chimu_latestDownloadUrl + '" data-turbolinks="false"\n' +
                '   class="btn-osu-mirror-chimu btn-osu-big btn-osu-big--beatmapset-header js-beatmapset-download-link"><span\n' +
                '        class="btn-osu-big__content "><span class="btn-osu-big__left"><span class="btn-osu-big__text-top">镜像下载</span><span\n' +
                '        class="btn-osu-hint btn-osu-big__text-bottom">获取地址中...</span></span><span class="btn-osu-big__icon"><span class="fa-fw"><i\n' +
                '        class="fas fa-download"></i></span></span></span></a>'
            );
        }
    }

    function updateButton() {
        let Azure99_btn = $('.btn-osu-mirror-Azure99')[0];
        if (Azure99_btn && Azure99_btn.href !== Azure99_latestDownloadUrl) {
            Azure99_btn.href = Azure99_latestDownloadUrl;
            $('.btn-osu-hint')[0].innerText = Azure99_reponseString;
        }
        let chimu_btn = $('.btn-osu-mirror-chimu')[0];
        if (chimu_btn && chimu_btn.href !== chimu_latestDownloadUrl) {
            chimu_btn.href = chimu_latestDownloadUrl;
            $('.btn-osu-hint')[2].innerText = chimu_reponseString;
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

    function getAzure99DownloadUrl(mapId) {
        if (Azure99_running) {
            return;
        }
        Azure99_running = true;
        Azure99_latestDownloadUrl = '';
        Azure99_reponseString = '获取地址中...';
        let Azure99_request = GM_xmlhttpRequest({
            method: 'GET',
            url: '/beatmapsets/' + mapId + '/download',
            headers: {
                'Referer': 'https://osu.ppy.sh/beatmapsets/' + mapId
            },
            onreadystatechange: function (status) {
                let url = status.finalUrl.toString();
                if (url.startsWith('https://bm') && status.readyState >= 2) {
                    Azure99_running = false;
                    Azure99_request.abort();
                    url = url.replace('.ppy.sh/', '.osu.rainng.com/');
                    Azure99_latestDownloadUrl = url;
                    console.log(url);
                    Azure99_reponseString = '由Azure99加速';
                }
            }
        });
    }

    function getChimuDownloadUrl(mapId) {
        if (chimu_running) {
            return;
        }
        chimu_running = true;
        chimu_latestDownloadUrl = '';
        chimu_reponseString = '获取地址中...';
        let chimu_request = GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.chimu.moe/v1/download/' + mapId + '?n=1',
            onreadystatechange: function (status) {
                let url = status.finalUrl.toString();
                if (url.startsWith('https://ipfs') && status.readyState >= 2 && status.status === 200) {
                    chimu_running = false;
                    chimu_request.abort();
                    chimu_latestDownloadUrl = url;
                    console.log(url);
                    chimu_reponseString = '由chimu加速';
                }
                else if(status.readyState >= 2 && status.status !== 200){
                    chimu_running = false;
                    chimu_request.abort();
                    console.log('chimu镜像站暂无此铺面');
                    chimu_reponseString = 'chimu暂无此铺面';
                }
            }
        });
    }
})();
