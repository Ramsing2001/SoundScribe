const textarea = document.querySelector("textarea");
const button = document.querySelector("#convert-btn");
const downloadButton = document.querySelector("#download-btn");
const languageSelector = document.querySelector("#language-selector");
const voiceSelector = document.querySelector("#voice-selector");

let synth = window.speechSynthesis;
let voices = [];

const populateVoices = () => {
  voices = synth.getVoices();
  voiceSelector.innerHTML = voices
    .filter(voice => voice.lang.startsWith(languageSelector.value))
    .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
    .join('');
};

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

languageSelector.addEventListener("change", populateVoices);

let audioBlob = null;

const textToSpeech = () => {
  const text = textarea.value;
  const selectedVoice = voices.find(voice => voice.name === voiceSelector.value);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const destination = audioContext.createMediaStreamDestination();
  const mediaRecorder = new MediaRecorder(destination.stream);
  const audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    downloadButton.classList.add('active');
    downloadButton.disabled = false;
  };

  const source = audioContext.createMediaStreamSource(destination.stream);
  const utteranceAudio = audioContext.createMediaStreamSource(destination.stream);
  utterance.onstart = () => {
    mediaRecorder.start();
  };

  utterance.onend = () => {
    mediaRecorder.stop();
    button.innerText = "Convert to Speech";
  };

  if (!synth.speaking && text) {
    button.innerText = "Speaking...";
    synth.speak(utterance);
  }
};

button.addEventListener("click", textToSpeech);

downloadButton.addEventListener("click", () => {
  if (audioBlob) {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "speech.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});
