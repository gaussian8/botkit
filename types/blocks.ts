export type TextObject = {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
};

export type ConfirmDialogObject = {
  title: TextObject;
  text: TextObject;
  confirm: TextObject;
  deny: TextObject;
  style?: string;
};

export type ButtonElement = {
  type: "button";
  text: TextObject;
  action_id: string;
  url?: string;
  value?: string;
  style?: string;
  confirm?: ConfirmDialogObject;
};
