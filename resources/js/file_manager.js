import axios from 'axios'

function imageUploader({ postId, images = [], multiple = true } = {}) {
  const generateId = () => '_' + Math.random().toString(36).substr(2, 9)

  return {
    images: images.map(img => ({ 
      id: img.id, 
      assetTypeId: img.assetTypeId, 
      altText: img.altText,
      credit: img.credit,
      src: img.assetUrl, 
      loading: false 
    })),
    identifier: generateId(),
    isHovered: false,
    isUploading: false,
    multiple,

    fileChosen(event) {
      this.fileToDataUrl(event, async src => {
        this.isUploading = true
        const id = generateId()

        if (this.multiple) {
          this.images.push({ id, src, file: event.target.files[0], loading: true, altText: '', credit: '' })
        } else {
          this.images = [{ id, src, file: event.target.files[0], loading: true, altText: '', credit: '' }]
        }

        const { data } = await axios.post('/api/studio/assets', this.getPayload(event.target.files[0]))
        
        if (!data.isSuccess) {
          // TODO: error handling
          this.images = this.images.filter(i => i.id !== id)
          return
        }

        this.images = this.images.map(i => i.id === id ? ({ ...i, src: `/img/${data.asset.filename}`, id: data.asset.id, loading: false }) : i)
        event.target.value = null
        this.isUploading = false
      })
    },

    async fileRemove(id) {
      await axios.delete(`/api/studio/assets/${id}`)
      this.images = this.images.filter(i => i.id !== id)
    },

    fileToDataUrl(event, callback) {
      if (!event.target.files.length) return

      let file = event.target.files[0]
      let reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onload = e => callback(e.target.result)
    },

    getPayload(file) {
      const formData = new FormData()
      
      if (postId) {
        formData.append("postId", postId)
        console.log({ formData })
      }

      formData.append("image", file)

      return formData
    },
  }
}

window.imageUploader = imageUploader