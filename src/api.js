// pass in object as params
export async function generateHeatmap(option, params) {
  // naive heatmap for now
  let url = 'http://localhost:5000/';
  if (option === '1') {
    // make api call
    url += 'naive/' + params.dat_id;
    return makeApiCall(url);
  } else if (option === '2') {
    // make api call
    url += 'by_reward/' + params.range_type + '/' + params.percentage + '/' + params.dat_id;
    return makeApiCall(url);
  }
}

async function makeApiCall(url) {
  const response = await fetch(url);
  const responseJSON = response.json();
  return responseJSON;
}
