// set initial state of application variables
let isRecording = false;
let socket;
let recorder;
const token = "";
// runs real-time transcription and handles global variables

const chatSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/chat/" + roomName + "/"
);

chatSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  console.log("chatSock.onmessage: ", data);
};

chatSocket.onclose = function (e) {
  console.error("Chat socket closed unexpectedly");
};

export const run = async () => {
  if (isRecording) {
    console.log("is recording : true");
    if (socket) {
      socket.send(JSON.stringify({ terminate_session: true }));
      socket.close();
      socket = null;
    }

    if (recorder) {
      recorder.pauseRecording();
      console.log("paused recording");
      recorder = null;
    }
  } else {
    // establish wss with AssemblyAI (AAI) at 16000 sample rate
    socket = await new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    );
    console.log("working");
    // handle incoming messages to display transcription to the DOM
    const texts = {};
    let prev_audio_start = 0;
    let prev_text = "";
    socket.onmessage = (message) => {
      console.log("on message");
      let msg = "";
      const res = JSON.parse(message.data);
      texts[res.audio_start] = res.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`;
        }
      }
      console.log(msg + "aaaaaaa");

      if (!!prev_text && res.audio_start != prev_audio_start) {
        prev_audio_start = res.audio_start;
        chatSocket.send(JSON.stringify({ message: prev_text }));
        console.log("message sent");
      }
      prev_text = res.text;
    };

    socket.onerror = (event) => {
      console.error(event);
      socket.close();
    };

    socket.onclose = (event) => {
      console.log("close ayi");
      if (!!prev_text) {
        //chatSocket.send(JSON.stringify({ message: prev_text }));
        console.log("message sent via chatsock");
      }
      console.log(event);
      socket = null;
    };

    socket.onopen = () => {
      console.log("open ay");
      // once socket is open, begin recording
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 1000, // set 250 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;

                // audio data must be sent as a base64 encoded string
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  );
                }
              };
              reader.readAsDataURL(blob);
            },
          });

          recorder.startRecording();
        })
        .catch((err) => console.error(err));
    };
  }

  isRecording = !isRecording;
};
console.log("index.html script");

// const buttonEl = document.getElementById('button');
// buttonEl.addEventListener('click', () => run());
