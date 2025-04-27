package dev.chatbot.aiservice;

import dev.langchain4j.model.chat.listener.ChatModelErrorContext;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import lombok.extern.slf4j.Slf4j;

/**
 * @author zhoumo
 */
@Slf4j
public class ChatbotChatModelListener implements ChatModelListener {

    @Override
    public void onRequest(ChatModelRequestContext requestContext) {
        // TODO: chat model request message
        log.info("onRequest(): {}", requestContext.chatRequest());
    }

    @Override
    public void onResponse(ChatModelResponseContext responseContext) {
        // TODO: chat model response message
        log.info("onResponse(): {}", responseContext.chatResponse());
    }

    @Override
    public void onError(ChatModelErrorContext errorContext) {
        // TODO: chat model error message
        log.info("onError(): {}", errorContext.error().getMessage());
    }
}
