interface InteractionPayloadI {
  type: 'view_submission' | 'block_actions' | 'message_action';
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  team: {
    id: string;
    domain: string;
  };
  trigger_id: string;
  token: string;
}

interface MessageActionPayloadI extends InteractionPayloadI {
  channel: {
    id: string;
    name: string;
  };
  message: {
    type: string;
    text: string;
    user: string;
    ts: string;
    team: string;
    blocks: any[];
  };
}

export default InteractionPayloadI;
export { MessageActionPayloadI };
