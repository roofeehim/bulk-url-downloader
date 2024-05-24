document.getElementById('download-button').addEventListener('click', function() {
  const urlList = document.getElementById('url-list').value.split('\n').filter(url => url.trim() !== '');
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = `Starting download of ${urlList.length} files...`;

  chrome.runtime.sendMessage({ urls: urlList }, function(response) {
    if (response.responses.length > 0) {
      let successCount = 0;
      let errorMessages = [];
      response.responses.forEach(res => {
        if (res.success) {
          successCount++;
        } else {
          errorMessages.push(`Error downloading ${res.url}: ${res.message}`);
        }
      });
      statusDiv.textContent = `Downloaded ${successCount} files successfully.`;
      if (errorMessages.length > 0) {
        statusDiv.innerHTML += `<br>Failed downloads:<br>${errorMessages.join('<br>')}`;
      }
    } else {
      statusDiv.textContent = 'No files to download.';
    }
  });
});
