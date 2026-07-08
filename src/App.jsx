import { useState } from 'react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = 'gshopimages'

function App() {
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setImageUrl(data.secure_url)
    setUploading(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Cloudinary Test</h2>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <>
          <p>✅ Cloudinary connected!</p>
          <img src={imageUrl} alt="test" style={{ width: '300px', marginTop: '1rem' }} />
        </>
      )}
    </div>
  )
}

export default App