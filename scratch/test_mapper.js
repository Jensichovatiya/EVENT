const http = require('http');

const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  let clean = path;
  if (clean.startsWith('~')) {
    clean = clean.substring(1);
  }
  clean = clean.replace(/\\/g, '/');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  return clean;
};

// Copy eventToDraft logic from mappers.ts
const eventToDraft = (ev) => {
  const documents = ev.documents ?? ev.Documents ?? [];
  console.log("Documents count from API:", documents.length);
  
  const faviconFile = [];
  const bannerFile = [];
  const shareImageFile = [];
  const galleryFiles = [];
  const documentFiles = [];
  const videoFiles = [];
  const audioFiles = [];

  documents.forEach((d) => {
    const rawPath = d.relativePath ?? d.RelativePath ?? '';
    const name = d.documentName ?? d.DocumentName ?? '';
    
    const cleanPath = normalizeImagePath(rawPath);
    const lowerPath = cleanPath.toLowerCase();
    const lowerName = name.toLowerCase();
    
    const isDoc = lowerPath.endsWith('.pdf') || lowerPath.endsWith('.doc') || lowerPath.endsWith('.docx') || lowerPath.endsWith('.xls') || lowerPath.endsWith('.xlsx') || lowerPath.endsWith('.txt') ||
                  lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.txt');
                  
    const isVideo = lowerPath.endsWith('.mp4') || lowerPath.endsWith('.webm') || lowerPath.endsWith('.ogg') || lowerPath.endsWith('.mov') || lowerPath.endsWith('.avi') ||
                    lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') || lowerName.endsWith('.mov') || lowerName.endsWith('.avi');
                    
    const isAudio = lowerPath.endsWith('.mp3') || lowerPath.endsWith('.wav') || lowerPath.endsWith('.aac') || lowerPath.endsWith('.m4a') ||
                    lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.aac') || lowerName.endsWith('.m4a');
                    
    let fileType = 'image/png';
    if (isDoc) fileType = name.endsWith('.pdf') ? 'application/pdf' : 'application/msword';
    else if (isVideo) fileType = 'video/mp4';
    else if (isAudio) fileType = 'audio/mpeg';

    const isExistingFile = {
      name,
      isExisting: true,
      previewUrl: cleanPath,
      type: fileType,
    };
    
    if (lowerPath.includes('/favicon/')) {
      faviconFile.push(isExistingFile);
    } else if (lowerPath.includes('/bannerimage/')) {
      bannerFile.push(isExistingFile);
    } else if (lowerPath.includes('/shareimage/')) {
      shareImageFile.push(isExistingFile);
    } else if (isVideo || lowerPath.includes('/videos/')) {
      videoFiles.push(isExistingFile);
    } else if (isAudio || lowerPath.includes('/audio/')) {
      audioFiles.push(isExistingFile);
    } else if (isDoc || lowerPath.includes('/documents/')) {
      documentFiles.push(isExistingFile);
    } else if (lowerPath.includes('/gallery/')) {
      galleryFiles.push(isExistingFile);
    }
  });

  return {
    faviconFile,
    bannerFile,
    shareImageFile,
    galleryFiles,
    documentFiles,
    videoFiles,
    audioFiles
  };
};

// Fetch via native http module
http.get('http://localhost:5209/api/events/1', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      const data = parsedData.data;
      console.log("Mapped Media Files:");
      console.log(JSON.stringify(eventToDraft(data), null, 2));
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
