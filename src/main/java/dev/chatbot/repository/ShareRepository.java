package dev.chatbot.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dev.chatbot.domain.Share;

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
    /**
     * delete a share by id and owner
     *
     * @param id share id
     * @param owner share owner
     */
    void deleteByIdAndOwner(UUID id, String owner);

    /**
     * list shares by owner with pagination
     *
     * @param owner share owner
     * @param pageable pagination info
     * @return
     */
    Page<Share> findByOwner(String owner, Pageable pageable);
}
