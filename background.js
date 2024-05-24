chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const urls = request.urls;
  const batchSize = 50; // 一度に処理するURLの数
  let currentBatch = 0;
  let completed = 0;
  let total = urls.length;
  let failedUrls = [];
  let responses = [];

  // URLのサニタイズ関数
  function sanitizeUrl(url) {
    try {
      let sanitizedUrl = new URL(url.trim());
      return sanitizedUrl.href;
    } catch (e) {
      return null;
    }
  }

  if (total === 0) {
    sendResponse({ message: 'No URLs provided!', failedUrls: [], responses: [] });
    return true;
  }

  function checkCompletion() {
    if (completed === total) {
      console.log(`All downloads attempted. Failed URLs: ${failedUrls.length}`);
      sendResponse({ message: 'All downloads attempted!', failedUrls: failedUrls, responses: responses });
    }
  }

  function downloadBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, urls.length);
    const batch = urls.slice(start, end);

    batch.forEach(url => {
      const sanitizedUrl = sanitizeUrl(url);
      if (sanitizedUrl) {
        console.log(`Attempting to download: ${sanitizedUrl}`);
        chrome.downloads.download({ url: sanitizedUrl }, function(downloadId) {
          if (chrome.runtime.lastError) {
            console.error(`Download error for ${sanitizedUrl}: ${chrome.runtime.lastError.message}`);
            failedUrls.push(sanitizedUrl);
            responses.push({ url: sanitizedUrl, success: false, message: chrome.runtime.lastError.message });
          } else {
            responses.push({ url: sanitizedUrl, success: true });
          }
          completed++;
          console.log(`Completed: ${completed}/${total}`);
          if (completed === end) {
            currentBatch++;
            downloadBatch();
          }
          checkCompletion();
        });
      } else {
        console.error(`Invalid URL: ${url}`);
        failedUrls.push(url);
        responses.push({ url: url, success: false, message: 'Invalid URL' });
        completed++;
        checkCompletion();
      }
    });
  }

  downloadBatch();
  return true; // 非同期応答を示す
});
