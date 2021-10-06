const audio = document.querySelector('audio');
const listStracks = document.querySelector('.list_tracks');
const playTool = document.querySelector('.play_tool');
const nameTracks = document.querySelector('.name_tracks');
const artists = document.querySelector('.artists');
const audioImage = document.querySelector('.audio_image');
const progress = document.querySelector('.progress');
const percentProgress = document.querySelector('.percent_progress');
const currTime = document.querySelector('.curr_time');
const totalTime = document.querySelector('.total_time');
const loop = document.querySelector('.loop');
const back = document.querySelector('.back');
const next = document.querySelector('.next');
const random = document.querySelector('.random');
const listSong = document.querySelector('.list_tracks');

let lengthTime;
audio.onloadedmetadata = () => {
    lengthTime = audio.duration;
}

const app = {
    currentIndex: 0,
    isPlay: false,
    isRandom: false,
    init: function (data, idx) {
        audio.src = data[idx].audioFile;
        audioImage.src = data[idx].audioImage;
        nameTracks.textContent = data[idx].audioName;
        artists.textContent = data[idx].audioArtists;
        // display time of audio
        audio.addEventListener('loadedmetadata', () => {
            totalTime.textContent = this.convertTime(Math.floor(audio.duration));
        });
    },
    convertTime: function (seconds) {
        let minutes = Math.floor(seconds / 60);
        let s = seconds - minutes * 60;
        if (s >= 10)
            return minutes + ':' + s;
        else
            return minutes + ':0' + s;
    },
    renderListSong: function (data) {
        const html = data.map(data => {
            return `
                    <div class="tracks">
                        <div class="info">
                            <img class="thumbnail" src=${data.audioImage}></img>
                            <div class="text_info">
                                <h3 class="name">${data.audioName}</h3>
                                <p class="artists_name">${data.audioArtists}</p>
                            </div>
                        </div>
                        <div class="detail">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
                `
        });
        listStracks.innerHTML = html.join('');
    },
    handleEvent: function (data) {
        // play or pause
        this.playTool();
        // jump time
        this.jumpTime();
        // loop
        this.loop();
        // back
        this.backSong(data);
        // next 
        this.nextSong(data);
        // random song
        this.randomSong();
        // choose song
        this.chooseSong(data);
    },
    playTool: function () {
        playTool.addEventListener('click', () => {
            // console.log(audio.duration)
            if (!this.isPlay) {
                audio.play();
                this.isPlay = true;
                document.querySelector('.play').style.opacity = 0;
                document.querySelector('.pause').style.opacity = 1;
            } else {
                audio.pause();
                this.isPlay = false;
                document.querySelector('.play').style.opacity = 1;
                document.querySelector('.pause').style.opacity = 0;
            }
        });
    },
    progressTime: function () {
        let progress = setInterval(() => {
            currTime.textContent = this.convertTime(Math.floor(audio.currentTime));
            percentProgress.style.width = audio.currentTime / lengthTime * 100 + '%';
        }, 100);
    },
    jumpTime: function () {
        progress.addEventListener('click', (event) => {
            let percent = event.offsetX / progress.offsetWidth;
            audio.currentTime = Math.floor(lengthTime * percent);
        });
        isDown = false;
        progress.addEventListener('mousedown', () => {
            isDown = true;
        });
        progress.addEventListener('mousemove', (event) => {
            if (!isDown) return;
            percentProgress.style.width = event.offsetX / progress.offsetWidth * 100 + '%';
        });
        progress.addEventListener('mouseup', () => {
            isDown = false;
            audio.currentTime = event.offsetX / progress.offsetWidth * lengthTime;
        });
    },
    loop: function () {
        loop.addEventListener('click', () => {
            if (audio.loop) {
                audio.loop = false;
                loop.style.color = '#1D3557';
            } else {
                audio.loop = true;
                loop.style.color = '#E63946';
            }
        });
    },
    backSong: function (data) {
        back.addEventListener('click', () => {
            back.classList.add('active');
            back.addEventListener('animationend', () => {
                back.classList.remove('active');
            });
            if (app.currentIndex == 0) {
                app.currentIndex = data.length - 1;
            } else {
                app.currentIndex--;
            }
            app.init(data, app.currentIndex);
            audio.play();
        });
    },
    nextSong: function (data) {
        next.addEventListener('click', () => {
            next.classList.add('active');
            next.addEventListener('animationend', () => {
                next.classList.remove('active');
            });
            if (app.currentIndex == data.length - 1) {
                app.currentIndex = 0;
            } else {
                app.currentIndex++;
            }
            app.init(data, app.currentIndex);
            audio.play();
        });
    },
    randomSong: function () {
        random.addEventListener('click', () => {
            if (app.isRandom) {
                app.isRandom = false;
                random.style.color = '#1D3557';
            } else {
                app.isRandom = true;
                random.style.color = '#E63946';
            }
        });
    },
    autoNextSong: function (data) {
        audio.addEventListener('ended', () => {
            if (audio.loop) return;
            if (!app.isRandom) {
                if (app.currentIndex == data.length - 1)
                    app.currentIndex = 0;
                else
                    app.currentIndex++;
                app.init(data, app.currentIndex);
                audio.play();
            } else {
                app.currentIndex = Math.floor(Math.random() * data.length);
                app.init(data, app.currentIndex);
                audio.play();
            }
        });
    },
    chooseSong: function (data) {
        const thumbnails = listSong.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                app.init(data, index);
                audio.play();
            });
        });
        const names = listSong.querySelectorAll('.name');
        names.forEach((name, index) => {
            name.addEventListener('click', () => {
                app.init(data, index);
                audio.play();
            });
        })
    }
};

async function getData() {
    const response = await fetch('./data.json');
    const data = response.json();
    return data;
}
getData()
    .then(data => {
        data = data.audio;
        app.init(data, 0);
        app.renderListSong(data);
        app.handleEvent(data);
        app.progressTime();
        app.autoNextSong(data);
    }).catch(() => {
        alert('system error');
    });