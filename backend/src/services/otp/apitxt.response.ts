export type ApitxtSendResponse = {
  status?: number | string;
  message?: string;
  type?: string;
};

export const isApitxtOtpAccepted = (httpStatus: number, payload: ApitxtSendResponse): boolean => {
  if (httpStatus < 200 || httpStatus >= 300) {
    return false;
  }

  const type = payload.type?.trim().toLowerCase();
  if (type && type !== "success") {
    return false;
  }

  const message = payload.message?.trim().toLowerCase();
  if (message === "error" || message === "fail" || message === "failed") {
    return false;
  }

  if (payload.status === undefined || payload.status === null || payload.status === "") {
    return true;
  }

  const numeric = typeof payload.status === "number" ? payload.status : Number(payload.status);
  if (!Number.isNaN(numeric)) {
    if (numeric === 1) {
      return true;
    }
    return numeric >= 200 && numeric < 300;
  }

  const statusText = String(payload.status).trim().toLowerCase();
  return statusText === "success" || statusText === "ok";
};
