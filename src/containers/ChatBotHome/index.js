import React, { useState, useRef, useEffect } from "react";
import { ReactSVG } from "react-svg";
import { IconSvg } from "../../styles/globalIcons";
import { getStyles } from "./styles";
import { CloseIcon } from "@mui/icons-material/Close";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Check,
  Close,
  ContentCopy,
  Link,
  Refresh,
  Message,
} from "@mui/icons-material";

import { handleQuery } from "../../utils/getChatDetails";
import MarkdownRenderer from "../../utils/MarkdownRenderer";

import AnalyticsChatsApi from "../../api/services/AnalyticsChatsApi";
import { useAppContext } from "../../context/AppContext";
import ThinkingIndicator from "./ThinkingIndicator";
import LogoPreview from "./LogoPreview";

export default function ChatBotHome(props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { chatSourceState, setChatSourceState } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const streamAbortRef = useRef(null);
  const isStoppedRef = useRef(false);

  const [chatLoading, setChatLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [tooltipText, setTooltipText] = useState("Copy to clipboard");
  const [sessionId, setSessionId] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const thinkStatus = false;

  useEffect(() => {
    const { DEFAULT_MESSAGE } = props?.config ?? {};
    const message = DEFAULT_MESSAGE?.message?.trim();

    if (DEFAULT_MESSAGE?.status && message) {
      setInputValue(message);
    }
  }, [props]);

  const initChat = {
    sender: "bot",
    session_id: null,
    message_id: null,
    messages: [
      {
        type: "chat",
        text: props?.config?.WELCOME_MESSAGE || "Hi There! How can I help you?",
      },
    ],
    is_chart: false,
    progress_status: false,
  };

  const [inputValue, setInputValue] = useState("");
  const [allMessages, setAllMessages] = useState([initChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const pushBotError = (text) => {
    setAllMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        session_id: sessionId,
        message_id: null,
        messages: [{ type: "chat", text: `⚠️ ${text}` }],
        is_chart: false,
        progress_status: false,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    fetchAllDataSource();
  }, []);

  const fetchAllDataSource = async () => {
    if (sourceLoading) return;
    setSourceLoading(true);
    try {
      let chat_datasets = [];
      if ((chatSourceState || [])?.length > 0) {
        chat_datasets = chatSourceState;
      } else {
        const response = await AnalyticsChatsApi.chatsetDetails();
        if (response.status === 200) {
          const responseData = response?.data?.data ?? [];
          if (responseData?.length > 0) {
            const selected_datasets =
              props?.config?.SOURCE_DETAILS?.datasets ?? [];
            const filteredData = responseData.filter((item) =>
              selected_datasets.includes(item.dataset_id),
            );
            chat_datasets = filteredData;
          }
        }
      }

      const default_dataset_id =
        props?.config?.SOURCE_DETAILS?.default_dataset ?? null;
      if (default_dataset_id) {
        const default_dataset = chat_datasets.find(
          (item) => item?.dataset_id === default_dataset_id,
        );
        if (default_dataset) {
          setSelectedSource(default_dataset);
        }
      }
      setChatSourceState(chat_datasets);
    } catch (error) {
      console.log(error);
      pushBotError("Failed to load data sources, try again.");
    } finally {
      setSourceLoading(false);
    }
  };

  const handleChatRefresh = async () => {
    try {
      setAllMessages([initChat]);
      setInputValue("");
      setChatLoading(false);
      setSessionId("");
      setCorrelationId("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (inputValue.trim() === "") return;

      if (!selectedSource || !selectedSource?.dataset_id?.trim()) {
        return;
      }

      setInputValue("");

      if (inputValue) {
        const userMessage = {
          sender: "user",
          session_id: null,
          message_id: null,
          messages: [{ type: "chat", text: inputValue }],
          is_chart: false,
          progress_status: false,
        };

        const botPlaceholder = {
          sender: "bot",
          session_id: null,
          message_id: null,
          messages: [{ type: "loading", text: "" }],
          text: "",
          is_chart: false,
          progress_status: true,
        };

        setAllMessages((prev) => [...prev, userMessage, botPlaceholder]);
        await handleChat(inputValue);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChat = async (chat_message) => {
    try {
      setChatLoading(true);
      const app_id = props?.config?.APP_DETAILS?.app_id ?? null;
      const response = await handleQuery(
        chat_message,
        sessionId,
        selectedSource,
        thinkStatus,
        app_id,
      );
      if (response.status === 200) {
        const responseData = response?.data ?? {};
        localStorage.setItem(
          "session_id",
          JSON.stringify(responseData?.session_id),
        );
        setSessionId(responseData?.session_id);
        setCorrelationId(responseData?.correlation_id);
        await handleResponseStream(
          responseData?.correlation_id,
          responseData?.session_id,
          chat_message,
        );
      }
    } catch (error) {
      console.error(error);
      pushBotError("Something went wrong. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleResponseStream = async (correlation_id, session_id, user_message) => {
    let accumulatedChat = "";

    // reset stop state
    isStoppedRef.current = false;
    streamAbortRef.current = new AbortController();

    const appendChunk = (existingText, newChunk) => {
      if (!newChunk) return existingText;
      if (
        existingText &&
        !existingText.endsWith('\n') &&
        /^\s*(\*|\-|\d+\.)\s/.test(newChunk)
      ) {
        return existingText + '\n' + newChunk;
      }
      return existingText + newChunk;
    };

    try {
      const reader = await AnalyticsChatsApi.queryResponseStream(
        correlation_id,
        session_id,
        user_message,
        streamAbortRef.current.signal
      );

      const decoder = new TextDecoder();

      while (true) {

        if (isStoppedRef.current || streamAbortRef.current.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n").filter(Boolean);

        for (const event of events) {

          if (isStoppedRef.current) break;
          if (!event.startsWith("data: ")) continue;

          let data;
          try {
            data = JSON.parse(event.replace("data: ", "").trim());
          } catch {
            continue;
          }

          if (isStoppedRef.current) break;

          if (data.response?.type === "chat" || data.response?.type === "image") {
            setAllMessages(prev => {
              if (isStoppedRef.current) return prev;

              const updated = [...prev];
              let last = updated.at(-1);

              if (!last || last.sender !== "bot") {
                last = {
                  session_id,
                  sender: "bot",
                  messages: [],
                  progress_status: true,
                };
                updated.push(last);
              }

              if (data.response.type === "chat") {
                accumulatedChat = appendChunk(
                  accumulatedChat,
                  data.response.data?.msg
                );

                updated[updated.length - 1] = {
                  ...last,
                  progress_status: true,
                  messages: [{ type: "chat", text: accumulatedChat }],
                };
              }

              if (data.response.type === "image") {
                updated[updated.length - 1] = {
                  ...last,
                  progress_status: true,
                  messages: [
                    ...last.messages,
                    {
                      type: "image",
                      url: data.response.data?.msg || "",
                    },
                  ],
                };
              }

              return updated;
            });
          }

          if (data.response?.data?.done) {
            setAllMessages(prev =>
              prev.map(m =>
                m.sender === "bot" && m.progress_status
                  ? { ...m, progress_status: false }
                  : m
              )
            );

            if (!isStoppedRef.current && "Notification" in window && Notification.permission === "granted") {
              new Notification("💬 Chatbot Response Ready", {
                body: "Your chatbot reply is complete.",
                tag: "chatbot-response",
              });
            }

            return;
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError" || isStoppedRef.current) {
        console.log("Stream stopped by user");
        return;
      }
      console.error("Stream Error:", error);
      pushBotError("Something went wrong. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStopMessage = async () => {
    if (isStoppedRef.current) return;
    isStoppedRef.current = true;

    streamAbortRef.current?.abort();
    AnalyticsChatsApi.queryChatStop(correlationId).catch(() => { });

    setChatLoading(false);

    setAllMessages((prev) =>
      prev.map((msg) =>
        msg.sender === "bot" && msg.progress_status
          ? {
            ...msg,
            progress_status: false,
            messages: [
              ...(msg.messages || []),
              { type: "chat", text: "[Response stopped by user]" },
            ],
          }
          : msg,
      ),
    );
  };

  const handleReloadDatasource = async () => {
    await fetchAllDataSource();
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message);
    setTooltipText("Copied! ✅");
    setTimeout(() => {
      setTooltipText("Copy to clipboard");
    }, 2000);
  };

  const handleClick = () => {
    try {
      const feedback_url = props?.config?.APP_DETAILS?.feedback_url ?? "";
      if (!feedback_url.trim()) return;
      window.open(feedback_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (window.parent !== window) {
      try {
        const iframe = window.parent.document.getElementById(
          "ameya-simple-chatbot-iframe",
        );
        if (iframe) {
          if (isOpen) {
            iframe.style.width = "420px";
            iframe.style.height = "560px";
          } else {
            iframe.style.width = "80px";
            iframe.style.height = "80px";
          }
        }
      } catch (error) {
        console.error("Cannot resize iframe:", error);
      }
    }
  }, [isOpen]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} sx={styles.launchButton}>
          <ReactSVG
            src={
              {
                chatlaunch1: IconSvg.chatlaunch1Icon,
                chatlaunch2: IconSvg.chatlaunch2Icon,
                chatlaunch3: IconSvg.chatlaunch3Icon,
                chatlaunch4: IconSvg.chatlaunch4Icon,
              }[props?.config?.APP_DETAILS?.app_launch_icon] ||
              IconSvg.chatlaunch1Icon
            }
            beforeInjection={(svg) => {
              svg.setAttribute(
                "style",
                "width:24px; height:24px; display:block;",
              );
            }}
          />
        </Button>
      )}

      {isOpen && (
        <Box sx={styles.chatBotMainContainer}>
          <Box sx={styles.chatbotBody}>
            <Box sx={styles.chatContainerHeader}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Box
                  width={"32px"}
                  height={"32px"}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    "& img, & svg": {
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    },
                  }}
                >
                  <LogoPreview config={props?.config} />
                </Box>

                <Typography styles={styles.chatbotHeading}>
                  {props?.config?.APP_DETAILS?.app_name}
                </Typography>
              </Box>
              <ButtonGroup>
                <IconButton
                  onClick={() => {
                    setIsOpen(false);

                    window.parent?.openSmartHelpPopup?.();
                  }}
                  sx={styles.botClose}
                >
                  <Message />
                </IconButton>

                <IconButton onClick={handleChatRefresh} sx={styles.botClose}>
                  <Refresh />
                </IconButton>
                <IconButton
                  onClick={() => setIsOpen(false)}
                  sx={styles.botClose}
                >
                  <Close />
                </IconButton>
              </ButtonGroup>
            </Box>
            <Box sx={styles.chatContainerBody}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {allMessages.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection:
                        item.sender === "user" ? "row-reverse" : "row",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    {item.sender === "bot" && (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.primary.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          width={"24px"}
                          height={"24px"}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          sx={{
                            "& img, & svg": {
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            },
                          }}
                        >
                          <LogoPreview config={props?.config} />
                        </Box>
                      </Box>
                    )}

                    {/* {item.is_chart &&
                                            (<Box>
                                                Need to handle the chart
                                            </Box>)
                                        } */}

                    {!item.is_chart && (
                      <Box sx={styles.messageStyle(item.sender === "user")}>
                        {(item.messages || [])?.length > 0 &&
                          (item.messages || [])?.map((message, msgIndex) => (
                            <Box key={msgIndex}>
                              {item.sender === "bot" &&
                                item.progress_status &&
                                !isStoppedRef.current && <ThinkingIndicator />}

                              {/* USER MESSAGE */}
                              {/* {item.sender === "user" &&
                                !item.progress_status &&
                                message.type === "chat" && (
                                  <Typography
                                    sx={styles.textStyle(
                                      item.sender === "user",
                                    )}
                                  >
                                    {message.text}
                                  </Typography>
                                )} */}

                              {/* BOT MESSAGE */}
                              {/* {item.sender === "bot" &&
                                !item.progress_status &&
                                message.type === "chat" && (
                                  <span
                                    style={styles.textStyle(
                                      item.sender === "user",
                                    )}
                                  >
                                    <MarkdownRenderer
                                      displayData={message.text}
                                    />
                                  </span>
                                )} */}


                              {/* USER MESSAGE */}
                              {item.sender === "user" && !item.progress_status && message.type === "chat" && (
                                <Typography sx={styles.textStyle(item.sender === "user")}>
                                  {message.text}
                                </Typography>
                              )}

                              {/* BOT MESSAGE */}
                              {item.sender === "bot" && !item.progress_status && message.type === "chat" && (
                                <span style={styles.textStyle(item.sender === "user")}>
                                  <MarkdownRenderer displayData={message.text} />
                                </span>
                              )}

                              {item.sender === "bot" &&
                                !item.progress_status &&
                                message.type === "image" && (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      width: "100%",
                                      marginTop: "2px",
                                    }}
                                  >
                                    <img
                                      src={message?.url}
                                      alt="S3 Asset"
                                      style={{
                                        maxWidth: "100%",
                                        height: "auto",
                                      }}
                                    />
                                  </Box>
                                )}

                              {item.sender === "bot" &&
                                !item.progress_status &&
                                message.type === "chat" &&
                                index > 0 && (
                                  <Box sx={styles.msgSettingContainer}>
                                    <Tooltip title={tooltipText} arrow>
                                      <Box
                                        onClick={() => handleCopy(message.text)}
                                        sx={{
                                          color: "black",
                                          cursor: "pointer",
                                        }}
                                      >
                                        {tooltipText === "Copied! ✅" ? (
                                          <Check
                                            sx={{
                                              height: "14px",
                                              width: "14px",
                                            }}
                                          />
                                        ) : (
                                          <ContentCopy
                                            sx={{
                                              height: "14px",
                                              width: "14px",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Tooltip>

                                    {props?.config?.APP_DETAILS
                                      ?.feedback_status && (
                                        <Tooltip title="Link" arrow>
                                          <span>
                                            <Link
                                              sx={{
                                                fontSize: 18,
                                                color: "#000000",
                                                cursor: "pointer",
                                              }}
                                              onClick={handleClick}
                                            />
                                          </span>
                                        </Tooltip>
                                      )}
                                  </Box>
                                )}
                            </Box>
                          ))}
                      </Box>
                    )}
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
            </Box>

            <Box sx={styles.chatContainerFooter}>
              {!selectedSource?.dataset_id && (
                <Box
                  sx={{
                    backgroundColor: theme.palette.error.light,
                    borderRadius: "6px",
                    padding: "8px",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    color: "#ffffff",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#ffffff",
                      flex: 1,
                    }}
                  >
                    Data source not available.
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleReloadDatasource}
                    disabled={sourceLoading}
                    sx={{
                      color: "#000000",
                      backgroundColor: "#ffffff",
                      borderColor: "#000000",
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        borderColor: "#000000",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                        color: "#9e9e9e",
                        borderColor: "#d9d9d9",
                      },
                    }}
                  >
                    {sourceLoading ? "Reloading..." : "Reload"}
                  </Button>
                </Box>
              )}

              <Box style={{ display: "flex", gap: "0.5rem" }}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ backgroundColor: "#FFFFFF" }}
                      >
                        <IconButton
                          disabled={
                            sourceLoading ||
                            !selectedSource?.dataset_id ||
                            (!chatLoading && !inputValue.trim())
                          }
                        >
                          {chatLoading ? (
                            <ReactSVG
                              src={IconSvg.stopMsgIcon}
                              onClick={handleStopMessage}
                              beforeInjection={(svg) => {
                                svg.setAttribute(
                                  "style",
                                  "width:24px;height:24px;display:block;cursor:pointer;",
                                );
                              }}
                            />
                          ) : (
                            <ReactSVG
                              src={IconSvg.sendMsgIcon}
                              onClick={handleSendMessage}
                              beforeInjection={(svg) => {
                                svg.setAttribute(
                                  "style",
                                  "width:24px;height:24px;display:block;cursor:pointer;",
                                );
                              }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: {
                      fontSize: "14px",
                      fontWeight: "400",
                      height: "45px",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      backgroundColor: "#FFFFFF",
                      color: "black",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid #D9D9D9`,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid #D9D9D9`,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid #D9D9D9`,
                      },
                      "&.Mui-active .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid #D9D9D9`,
                      },
                    },
                  }}
                />
              </Box>

              {!props?.config?.UI_CONFIGS?.poweredby_logo_status && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Typography>Powered by</Typography>
                    <ReactSVG
                      src={IconSvg.ameyaLogoIcon}
                      beforeInjection={(svg) => {
                        svg.setAttribute(
                          "style",
                          "width:88px; height:30px; display:block;",
                        );
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Button onClick={() => setIsOpen(false)} sx={styles.closeBtn}>
            <ReactSVG
              src={IconSvg.chatbot_colapsIcon}
              beforeInjection={(svg) => {
                svg.setAttribute(
                  "style",
                  "width:24px; height:24px; display:block;",
                );
              }}
            />
          </Button>
        </Box>
      )}

      <style>
        {`@keyframes slideIn {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `}
      </style>
    </Box>
  );
}
