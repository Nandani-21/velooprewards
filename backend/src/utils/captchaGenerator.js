import crypto from 'node:crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 6) {
  return Array.from({ length }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
}

export function createCaptchaPayload() {
  const captchaText = randomCode();
  const similarOne = `${captchaText[0]}${captchaText[2]}${captchaText[1]}${captchaText.slice(3)}`;
  const similarTwo = `${captchaText.slice(0, 2)}${captchaText[4]}${captchaText[3]}${captchaText[5]}`;
  let different = randomCode();
  while (different === captchaText || different === similarOne || different === similarTwo) different = randomCode();
  const options = [captchaText, similarOne, similarTwo, different].sort(() => crypto.randomInt(-1, 2));
  return { captchaText, options, correctOption: captchaText };
}
