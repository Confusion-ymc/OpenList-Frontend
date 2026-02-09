import { createMD5, createSHA1, createSHA256 } from "hash-wasm"

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  const { file } = e.data
  try {
    const md5Digest = await createMD5()
    const sha1Digest = await createSHA1()
    const sha256Digest = await createSHA256()
    const reader = file.stream().getReader()
    let loaded = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      loaded += value.length
      md5Digest.update(value)
      sha1Digest.update(value)
      sha256Digest.update(value)
      self.postMessage({
        type: "progress",
        progress: (loaded / file.size) * 100,
      })
    }
    const md5 = md5Digest.digest("hex")
    const sha1 = sha1Digest.digest("hex")
    const sha256 = sha256Digest.digest("hex")
    self.postMessage({
      type: "result",
      hash: { md5, sha1, sha256 },
    })
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
