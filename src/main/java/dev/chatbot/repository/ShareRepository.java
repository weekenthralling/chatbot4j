package dev.chatbot.repository;

import dev.chatbot.domain.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author zhoumo
 */
@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {
}
