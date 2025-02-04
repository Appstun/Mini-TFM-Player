"use strict";
let audioVolume = localStorage.getItem("player.control.volume") ? parseFloat(localStorage.getItem("player.control.volume")) : 0.1;
const popupButtonElelment = document.getElementById("window.button.popup");
const playerSongTitleElement = document.getElementById("player.song.info.title");
const playerSongArtistElement = document.getElementById("player.song.info.artist");
const playerSongImageElement = document.getElementById("player.song.image");
const playerSongLinkElement = document.getElementById("player.song.info.link");
const presenterNameElement = document.getElementById("presenter.name");
const presenterShowElement = document.getElementById("presenter.show");
const presenterShowtimeElement = document.getElementById("presenter.showTime");
const presenterImageElement = document.getElementById("presenter.image");
const playerPlayButtonElement = document.getElementById("player.control.button.play");
const playerPauseButtonElement = document.getElementById("player.control.button.pause");
const playerResyncButtonElement = document.getElementById("player.control.button.resync");
const playerResyncButtonFrameElement = document.getElementById("player.control.button.resync.frame");
const playerVolumeElement = document.getElementById("player.control.slider.volume");
const playerFrameElement = document.getElementById("player.frame");
const siteInfoElement = document.getElementById("site.info");
const audioPlayer = new Audio("https://live.truckers.fm");
function mainInit() {
    audioPlayer.volume = audioVolume;
    playerVolumeElement.value = audioVolume.toString();
    if (checkIsMobile())
        document.getElementById("window.banner.device.mobile")?.classList.remove("invisible");
    else
        document.getElementById("window.banner.device.mobile")?.remove();
    if (checkIsPopup()) {
        popupButtonElelment.classList.add("invisible");
        siteInfoElement.style.display = "none";
        for (let i = 0; i < 4; i++)
            setTimeout(() => resizeWindowToContent(400, 120), 50 * i);
        setTimeout(() => window.scrollTo(0, 0), 210);
    }
    else
        popupButtonElelment.classList.remove("invisible");
    if (window.location.hostname != "127.0.0.1") {
        setCurrentPresenter();
        setCurrentSong();
    }
}
let firstPlay = true;
async function playAudio() {
    if (firstPlay) {
        firstPlay = false;
        resyncAudio();
        return;
    }
    playerPlayButtonElement.classList.add("invisible");
    playerPauseButtonElement.classList.remove("invisible");
    await audioPlayer.play();
}
function pauseAudio() {
    playerPlayButtonElement.classList.remove("invisible");
    playerPauseButtonElement.classList.add("invisible");
    audioPlayer.pause();
}
async function resyncAudio() {
    playerResyncButtonFrameElement.classList.add("spinCC");
    playerResyncButtonElement.style.fill = "#f1c40f";
    try {
        audioPlayer.load();
    }
    catch (e) {
        console.error("Failed to resync audio");
        console.error(e);
    }
    await playAudio();
    playerResyncButtonFrameElement.classList.remove("spinCC");
    playerResyncButtonElement.style.fill = "";
}
function adjustVolume(volume) {
    audioPlayer.volume = volume;
    localStorage.setItem("player.control.volume", volume.toString());
}
function createPopup() {
    const popup = window.open(".", "popup", `width=40px,height=40px`);
    popup.focus();
}
function resizeWindowToContent(overrideWidth = null, overrideHeight = null) {
    let contentWidth = overrideWidth != null ? overrideWidth : playerFrameElement.scrollWidth;
    let contentHeight = overrideHeight != null ? overrideHeight : playerFrameElement.scrollHeight;
    let browser = getBrowser();
    if (browser == "Firefox")
        contentHeight -= 2;
    window.resizeTo(contentWidth + (window.outerWidth - window.innerWidth), contentHeight + (window.outerHeight - window.innerHeight));
}
async function setCurrentSong() {
    const song = await getTFMSong();
    if (!song)
        return;
    playerSongTitleElement.textContent = song.title;
    playerSongTitleElement.title = song.title;
    playerSongArtistElement.textContent = song.artist;
    playerSongArtistElement.title = song.artist;
    playerSongLinkElement.classList.remove("invisible");
    playerSongLinkElement.href = song.spotifyLink;
    playerSongImageElement.src = song.albumLink;
    imageloaderRemoval(playerSongImageElement);
}
async function setCurrentPresenter() {
    const presenter = await getTFMPresenter();
    if (!presenter)
        return;
    let time = "";
    if (presenter.show.end && presenter.show.end != "0")
        time = `until ${new Date(parseInt(presenter.show.end) * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    presenterNameElement.textContent = presenter.presenter.name;
    presenterNameElement.title = presenter.presenter.name;
    presenterShowElement.textContent = presenter.show.name;
    presenterShowElement.title = presenter.show.name;
    presenterShowtimeElement.textContent = time;
    presenterShowtimeElement.title = time;
    presenterImageElement.src = presenter.presenter.image;
    imageloaderRemoval(presenterImageElement);
}
async function getTFMSong() {
    try {
        let data = (await (await fetch("https://radiocloud.pro/api/public/v1/song/current")).json()).data;
        return {
            id: data.id,
            artist: data.artist,
            title: data.title,
            albumLink: data.album_art,
            spotifyLink: data.link,
            playedAt_sec: data.played_at,
            playCount: data.playcount,
        };
    }
    catch (e) {
        return undefined;
    }
}
async function getTFMPresenter() {
    try {
        let data = (await (await fetch("https://radiocloud.pro/api/public/v1/presenter/live")).json()).data;
        return {
            show: {
                id: data.id,
                name: data.description,
                slug: data.slug,
                presenterId: data.user_id,
                permSlotId: data.perm_slot_id,
                type: data.type,
                start: data.start,
                midnight: data.midnight,
                end: data.end,
                secretSound: data.secret_sound,
                onDemand: data.on_demand,
            },
            presenter: {
                id: data.user.id,
                name: data.user.name,
                socials: data.user.socials,
                image: data.image,
                banner: data.banner,
            },
        };
    }
    catch (e) {
        return undefined;
    }
}
function checkIsPopup() {
    return window.opener && window.opener !== window;
}
const agents = ["Chrome", "Firefox", "Edg", "OPR"];
function getBrowser() {
    let browser = undefined;
    for (let agent of agents)
        if (navigator.userAgent.includes(agent))
            browser = agent;
    return browser;
}
function checkIsMobile() {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
function imageloaderRemoval(element) {
    const classes = ["imgSpin", "imgSpin2"];
    if (classes.some((c) => element.classList.contains(c))) {
        element.classList.remove(...classes);
        element.style.transitionDuration = "100ms";
        setTimeout(() => {
            element.style.borderRadius = "";
        }, 10);
    }
}
setInterval(() => setCurrentSong(), 10000);
setInterval(() => setCurrentPresenter(), 50000);
