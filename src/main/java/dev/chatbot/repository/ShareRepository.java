package dev.chatbot.repository;

import dev.chatbot.domain.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * @author zhoumo
 */
@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {
}
