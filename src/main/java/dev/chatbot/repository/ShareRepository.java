package dev.chatbot.repository;

import dev.chatbot.domain.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * ShareRepository is a repository interface for the Share entity.
 * It extends JpaRepository to provide CRUD operations.
 * This interface is used to interact with the database and perform operations
 * related to shares.
 * <p>
 * 
 * @author zhoumo
 */
@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {
}
