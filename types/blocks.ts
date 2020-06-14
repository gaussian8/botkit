export class TextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;

  constructor(text: string, type?: "plain_text" | "mrkdwn") {
    this.text = text;
    this.type = type !== undefined ? type : "plain_text";
  }
}

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
  action_id?: string;
  url?: string;
  value?: string;
  style?: string;
  confirm?: ConfirmDialogObject;
};

export type ActionObject = {
  action_id: string;
  block_id: string;
  text: TextObject;
  value?: string;
  type: "button" | "static_select";
  selected_option?: StaticOption;
  action_ts: string;
};

export class StaticOption {
  text: TextObject;
  value: string;

  constructor(text: string, value: string) {
    this.text = new TextObject(text);
    this.value = value;
  }
}

export class StaticSelect {
  type: "static_select" = "static_select";
  placeholder: {
    type: "plain_text";
    text: string;
    emoji?: boolean;
  };
  options: StaticOption[];

  constructor(placeholder: string, options: StaticOption[]) {
    this.placeholder = {
      type: "plain_text",
      text: placeholder,
    };
    this.options = options;
  }
}

export class BlockAction {
  context: "dashboards" | "panels";
  value: any;

  constructor(context: "dashboards" | "panels", value: any) {
    this.context = context;
    this.value = value;
  }
}
