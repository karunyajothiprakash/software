import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send, Search, Plus, Phone, Video,
  MoreVertical, Paperclip, Smile, Mail,
  MessageSquare, Bell, Archive, Star,
  Users, ChevronRight, Check, CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  participant_name: string;
  participant_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  type: "internal" | "external" | "email";
  avatar?: string;
  is_starred?: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "file" | "email";
}

export default function Communication() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "internal" | "email">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("last_message_time", { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !profile) return;
    const msg = newMessage.trim();
    setNewMessage("");
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConv.id,
        sender_id: profile.id,
        sender_name: profile.full_name,
        content: msg,
        type: "text",
        status: "sent",
      });
      if (error) throw error;
      await fetchMessages(selectedConv.id);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const matchSearch =
      c.participant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = activeTab === "all" || c.type === activeTab;
    return matchSearch && matchTab;
  });

  const timeStr = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const avatarInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const avatarColor = (name: string) => {
    const colors = ["#3b82f6", "#a855f7", "#22c55e", "#f97316", "#ec4899", "#eab308"];
    let sum = 0;
    for (const c of name || "") sum += c.charCodeAt(0);
    return colors[sum % colors.length];
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader title="Communication" subtitle="Internal messaging, email threads, and team collaboration" />

      <div style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "0", height: "calc(100vh - 180px)", background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
          {/* Left Sidebar */}
          <div style={{ borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column" }}>
            {/* Search & Tabs */}
            <div style={{ padding: "16px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <Search size={14} color="#555" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "32px", background: "#0d0d0d", border: "1px solid #1a1a1a", color: "#fff", fontSize: "13px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {(["all", "internal", "email"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: "6px 0", borderRadius: "6px", fontSize: "12px",
                      cursor: "pointer", border: "none", textTransform: "capitalize",
                      background: activeTab === tab ? "#eab308" : "#1a1a1a",
                      color: activeTab === tab ? "#000" : "#888", fontWeight: activeTab === tab ? 600 : 400,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* New Conversation Button */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
              <button
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px",
                  background: "rgba(234,179,8,0.08)", border: "1px dashed #eab30840",
                  color: "#eab308", fontSize: "13px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                <Plus size={14} /> New Conversation
              </button>
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #111", display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1a1a1a", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: "12px", background: "#1a1a1a", borderRadius: "3px", width: "60%", marginBottom: "6px" }} />
                      <div style={{ height: "10px", background: "#151515", borderRadius: "3px", width: "80%" }} />
                    </div>
                  </div>
                ))
              ) : filteredConvs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#555" }}>
                  <MessageSquare size={28} color="#333" style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ fontSize: "13px", margin: 0 }}>No conversations</p>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const color = avatarColor(conv.participant_name);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      style={{
                        padding: "12px 16px", cursor: "pointer",
                        borderBottom: "1px solid #111",
                        background: isSelected ? "#1a1a0a" : "transparent",
                        borderLeft: isSelected ? "3px solid #eab308" : "3px solid transparent",
                        display: "flex", gap: "10px", alignItems: "flex-start",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#141414"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "#1a1a0a" : "transparent"; }}
                    >
                      <div
                        style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          background: `${color}22`, border: `1px solid ${color}44`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, color, fontSize: "13px", fontWeight: 700,
                        }}
                      >
                        {avatarInitials(conv.participant_name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {conv.participant_name}
                          </span>
                          <span style={{ color: "#555", fontSize: "10px", flexShrink: 0, marginLeft: "8px" }}>
                            {timeStr(conv.last_message_time)}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                          <p style={{ color: "#666", fontSize: "11px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            {conv.last_message || "No messages yet"}
                          </p>
                          {conv.unread_count > 0 && (
                            <span
                              style={{
                                background: "#eab308", color: "#000",
                                width: "18px", height: "18px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "10px", fontWeight: 700, flexShrink: 0, marginLeft: "6px",
                              }}
                            >
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Chat Area */}
          {selectedConv ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Chat Header */}
              <div
                style={{
                  padding: "16px 20px", borderBottom: "1px solid #1a1a1a",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: `${avatarColor(selectedConv.participant_name)}22`,
                      border: `1px solid ${avatarColor(selectedConv.participant_name)}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: avatarColor(selectedConv.participant_name), fontSize: "13px", fontWeight: 700,
                    }}
                  >
                    {avatarInitials(selectedConv.participant_name)}
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                      {selectedConv.participant_name}
                    </p>
                    <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                      {selectedConv.participant_email}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[Phone, Video, MoreVertical].map((Icon, i) => (
                    <button
                      key={i}
                      style={{
                        width: "34px", height: "34px", borderRadius: "8px",
                        background: "#1a1a1a", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon size={15} color="#888" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", margin: "auto", color: "#555" }}>
                    <MessageSquare size={36} color="#333" style={{ display: "block", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px" }}>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === profile?.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
                          alignItems: "flex-end", gap: "8px",
                        }}
                      >
                        {!isMe && (
                          <div
                            style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              background: `${avatarColor(msg.sender_name)}22`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "10px", fontWeight: 700,
                              color: avatarColor(msg.sender_name), flexShrink: 0,
                            }}
                          >
                            {avatarInitials(msg.sender_name)}
                          </div>
                        )}
                        <div style={{ maxWidth: "65%" }}>
                          {!isMe && (
                            <p style={{ color: "#555", fontSize: "10px", margin: "0 0 3px 4px" }}>
                              {msg.sender_name}
                            </p>
                          )}
                          <div
                            style={{
                              padding: "10px 14px", borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                              background: isMe ? "#eab308" : "#1a1a1a",
                              color: isMe ? "#000" : "#ddd",
                              fontSize: "13px", lineHeight: "1.5",
                            }}
                          >
                            {msg.content}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                            <span style={{ color: "#444", fontSize: "10px" }}>
                              {timeStr(msg.created_at)}
                            </span>
                            {isMe && (
                              msg.status === "read" ? <CheckCheck size={10} color="#3b82f6" /> : <Check size={10} color="#555" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: "16px 20px", borderTop: "1px solid #1a1a1a",
                  display: "flex", gap: "10px", alignItems: "center",
                }}
              >
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#555" }}>
                  <Paperclip size={18} />
                </button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  style={{
                    flex: 1, background: "#0d0d0d", border: "1px solid #222",
                    color: "#fff", fontSize: "13px", borderRadius: "10px",
                  }}
                />
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#555" }}>
                  <Smile size={18} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: newMessage.trim() ? "#eab308" : "#1a1a1a",
                    border: "none", cursor: newMessage.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <Send size={15} color={newMessage.trim() ? "#000" : "#555"} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#555" }}>
              <MessageSquare size={48} color="#222" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", fontWeight: 500, color: "#444", margin: "0 0 8px" }}>
                Select a conversation
              </p>
              <p style={{ fontSize: "13px", color: "#333", margin: 0 }}>
                Choose from the left panel to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}