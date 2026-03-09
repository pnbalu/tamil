import * as Crypto from 'expo-crypto';

export async function hashSecretAnswer(answer) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    answer.trim().toLowerCase()
  );
  return digest;
}
