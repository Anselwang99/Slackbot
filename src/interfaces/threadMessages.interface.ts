interface ThreadMessageI {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  team: string;
  blocks: any[];
  thread_ts: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked: boolean;
  subscribed: boolean;
  last_read: string;
}

export default ThreadMessageI;
