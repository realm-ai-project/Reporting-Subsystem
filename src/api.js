// pass in object as params
export function generateHeatmap(params) {
  // naive heatmap for now
  let url = 'http://localhost:5000/';
  if (params.option == 1) {
    // make api call
    url += 'naive/';
    url += params.dat_id;

    fetch(url)
      .then(res => res.json)
      .then(result =>
        // do stuff with result response, send to frontend?
        console.log('succesfully generated heatmap for url: ' + url)
      );
  }
}
