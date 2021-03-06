// pass in object as params
export async function generateHeatmap(option, params) {
  // naive heatmap for now
  let url = 'http://localhost:5000/';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: params.file_path }),
  };
  if (option === '1') {
    url += 'naive';
    return makeApiCall(url, body);
  } else if (option === '2') {
    // url += 'by_reward/' + params.range_type + '/' + params.percentage;
    url += 'by_reward/' + params.hm2_start + '/' + params.hm2_end;
    return makeApiCall(url, body);
  } else if (option === '3') {
    // url += 'by_episode_length/' + params.range_type + '/' + params.percentage;
    url += 'by_episode_length/' + params.hm3_start + '/' + params.hm3_end;
    return makeApiCall(url, body);
  } else if (option === '4') {
    url += 'by_last_position';
    return makeApiCall(url, body);
  } else if (option === '5') {
    url += 'by_episode_num/' + params.hm5_start + '/' + params.hm5_end;
    return makeApiCall(url, body);
  }
}

export async function getAllVideos(userDirectory) {
  // naive heatmap for now
  let url = 'http://localhost:5000/getAllVideos';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: userDirectory }),
  };

  return makeApiCall(url, body);
}

export async function playVideo(videoPath) {
  // naive heatmap for now
  let url = 'http://localhost:5000/playVideo';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: videoPath }),
  };

  return makeApiCall(url, body);
}

export async function getAllHeatmaps(userDirectory) {
  let url = 'http://localhost:5000/getAllHeatmaps';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: userDirectory }),
  };

  return makeApiCall(url, body);
}

export async function deleteHeatmap(userDirectory, fileName) {
  let url = 'http://localhost:5000/deleteHeatmap';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: userDirectory, file_name: fileName }),
  };

  return makeApiCall(url, body);
}

export async function isValidDirectory(userDirectory) {
  let url = 'http://localhost:5000/isValidDirectory';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: userDirectory }),
  };

  return makeApiCall(url, body);
}

export async function getTenserboardHost(userDirectory) {
  let url = 'http://localhost:5000/launchTensorboard';

  const body = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_path: userDirectory }),
  };

  return makeApiCall(url, body);
}

export async function getRecentlySelectedDirectories() {
  let url = 'http://localhost:5000/recentDirectories';

  const response = await fetch(url);
  const responseJSON = response.json();
  return responseJSON;
}

async function makeApiCall(url, requestBody) {
  console.log(url);
  console.log(requestBody);
  const response = await fetch(url, requestBody);
  const responseJSON = response.json();
  return responseJSON;
}
