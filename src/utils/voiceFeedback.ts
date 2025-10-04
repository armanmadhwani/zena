export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.log('Speech synthesis not supported:', text);
  }
};
