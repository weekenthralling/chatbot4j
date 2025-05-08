package dev.chatbot.aiservice.listeners;

import dev.langchain4j.model.chat.listener.ChatModelErrorContext;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import jakarta.annotation.Nonnull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.stereotype.Component;

/**
 * <br>
 *
 * @author af su
 * @version v1.0
 */
@Component
@Conditional(DebugLoggingCondition.class)
public class LogChatModelListener implements ChatModelListener {

	private static final Logger log = LoggerFactory.getLogger(LogChatModelListener.class);

	@Override
	public void onRequest(ChatModelRequestContext requestContext) {
		log.debug("onRequest(): {}", requestContext.chatRequest());
	}

	@Override
	public void onResponse(ChatModelResponseContext responseContext) {
		log.debug("onResponse(): {}", responseContext.chatResponse());
	}

	@Override
	public void onError(ChatModelErrorContext errorContext) {
		log.debug("onError(): {}", errorContext.error().getMessage());
	}
}

class DebugLoggingCondition implements Condition {
	@Override
	public boolean matches(@Nonnull ConditionContext context,
	                       @Nonnull AnnotatedTypeMetadata metadata) {
		return LoggerFactory.getLogger("dev.chatbot").isDebugEnabled();
	}
}
