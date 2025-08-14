import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'

const StoryModel = ({setShowModal, fetchStories}) => {
    const bgcolor = ["#F87171","#FBBF24","#34D399","#60A5FA","#A78BFA","#F472B6","#FDBA74","#6EE7B7","#93C5FD","#C4B5FD"];

    const [mode, setMode] = useState("text")
    const [background, setBackground] = useState(bgcolor[0])
    const [text, setText] = useState("")
    const [media, setMedia] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if(file) {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleCreateStory = async() => {

    }

  return (
    <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
            <div className='text-center mb-4 flex items-center justify-between'>
                <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                    <ArrowLeft/>
                </button>
                <h2 className='text-lg font-semibold'>Create Story</h2>
                <span className='w-10'></span>
            </div>
            <div className='rounded-lg h-96 flex items-center justify-center relative' style={{backgroundColor: background}}>
                {mode === 'text' && (
                    <textarea className='bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none 
                    ' placeholder='Whats on your mind?' onChange={(e) => setText(e.target.value)} value={text} />
                )}
                {
                    mode === 'media' && previewUrl && (
                        media?.type.startsWith('image') ? (
                            <img src={previewUrl} alt='' className='object-contain max-h-full' />
                        ) : (
                            <video src={previewUrl} className='object-contain max-h-full' controls />
                        )
                )}
            </div>
            <div className='flex mt-4 gap-2'>
                {
                    bgcolor.map((color) => (
                        <button key={color}  className='w-6 h-6 rounded-full ring cursor-pointer' style={{ backgroundColor: color }} onClick={() => setBackground(color)}/>
                    ))
                }
            </div>
                <div className='flex gap-2 mt-4'>
                    <button onClick={() => { setMode('text'); setMedia(null); setPreviewUrl(null) }} className={`flex-l flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'text' ? 
                        "bg-white text-black" : "bg-zinc-800"}`}>
                        <TextIcon size={18} /> Text
                    </button>
                    <label className={`flex-l flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'media' ? "bg-white text-black" : "bg-zinc-800"}`}>
                        <input onChange={(e) => {handleMediaUpload(e); setMode('media')}} type="file" accept="image/*,video/*" className='hidden' />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>
                <button onClick={()=> toast.promise(handleCreateStory(), {
                    loading: 'Saving...',
                    success: <p>Story Added</p>,
                    error: e => <p>{e.message}</p>
                })} className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 
                to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'>
                    <Sparkle size={18} /> Create Story
                </button>
        </div>
      
    </div>
  )
}

export default StoryModel
