interface AuthorizationI {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}
interface EventPayloadI {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    bot_id?: string;
    client_msg_id?: string;
    type: string;
    subtype?: string;
    text: string;
    user: string;
    ts: string;
    thread_ts?: string;
    blocks: any[];
    team: string;
    channel: string;
    event_ts: string;
    channel_type?: string;
    reaction?: string;
    item?: any;
    item_user?: string;
  };
  type: string;
  event_id: string;
  event_time: number;
  authorizations: AuthorizationI[];
  is_ext_shared_channel: boolean;
  event_context: string;
}

interface MessageEventPayloadI extends EventPayloadI {
  context_team_id: string;
  context_enterprise_id: string | null;
}

type AppMentionEventPayloadI = EventPayloadI;

export default EventPayloadI;
export { MessageEventPayloadI, AppMentionEventPayloadI };
