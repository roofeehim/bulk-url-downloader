chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const urls = request.urls;
  let completed = 0;
  let total = urls.length;
  let failedUrls = [];
  let responses = [];

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

  urls.forEach(url => {
    if (url.trim()) {
      console.log(`Attempting to download: ${url.trim()}`);
      chrome.downloads.download({
        url: url.trim()
      }, function(downloadId) {
        if (chrome.runtime.lastError) {
          console.error(`Download error for ${url.trim()}: ${chrome.runtime.lastError.message}`);
          failedUrls.push(url.trim());
          responses.push({ url: url.trim(), success: false, message: chrome.runtime.lastError.message });
        } else {
          responses.push({ url: url.trim(), success: true });
        }
        completed++;
        console.log(`Completed: ${completed}/${total}`);
        checkCompletion();
      });
    } else {
      completed++;
      console.log(`Skipped empty URL. Completed: ${completed}/${total}`);
      checkCompletion();
    }
  });

  return true;
});
