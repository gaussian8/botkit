import Axios, { AxiosResponse } from "axios";
const FormData = require("form-data");

export interface Dashboard {
  uid: string;
  title: string;
}

const GRAFANA_BASE_URL = process.env.GRAFANA_BASE_URL;
const IMAGE_WIDTH = process.env.GRAFANA_IMAGE_WIDTH;
const IMAGE_HEIGHT = process.env.GRAFANA_IMAGE_HEIGHT;
const grafanaAuth = {
  Authorization: "Bearer " + process.env.GRAFANA_API_TOKEN,
};
const slackAuth = {
  Authorization: "Bearer " + process.env.BOT_TOKEN,
};

export function getDashboards() {
  let dashboards = [] as Dashboard[];
  return Axios.get(GRAFANA_BASE_URL + "/api/search", {
    headers: grafanaAuth,
    params: {
      type: "dash-db",
    },
  })
    .then((res) => {
      res.data.forEach((dashboard) => {
        dashboards.push({
          uid: dashboard.uid,
          title: dashboard.title,
        });
      });
      return dashboards;
    })
    .catch((err) => {
      console.error(err.message);
      return dashboards;
    });
}

export async function uploadImage(channel: string) {
  let imgBuffer = (await fetchImage("sMwzNazMz", 4, "now-1h", "now")) as Buffer;
  await uploadFileToSlack(imgBuffer, channel);
}

function fetchImage(dashBoardId: string, panelId: number, from: string, to: string) {
  return Axios.get(GRAFANA_BASE_URL + "/render/d-solo/" + dashBoardId, {
    responseType: "arraybuffer",
    params: {
      panelId: panelId,
      from: from,
      to: to,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
    },
    headers: grafanaAuth,
  })
    .then((res: AxiosResponse<Buffer>) => {
      return res.data;
    })
    .catch((err: Error) => {
      console.error(err.message);
      return undefined;
    });
}

function uploadFileToSlack(file: Buffer, channel: string) {
  const form = new FormData();
  form.append("file", file, "grafana_panel");
  form.append("filetype", "png");
  form.append("title", "sample title");
  form.append("channels", channel);

  return Axios.post("https://slack.com/api/files.upload", form, {
    headers: { ...slackAuth, ...form.getHeaders() },
  });
}
