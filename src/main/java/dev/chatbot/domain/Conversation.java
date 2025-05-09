package dev.chatbot.domain;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Conversation is an entity class that represents a conversation in the system.
 *
 * @author zhoumo
 */
@Getter
@Setter
@ToString
@Entity
@Table(
        name = "conversation",
        indexes = {@Index(name = "idx_conversation_owner", columnList = "owner")})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE conversation SET archived = true WHERE id = ?")
@SQLRestriction("archived = false")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamicInsert
@DynamicUpdate
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String owner;

    @Column(name = "title_generated", columnDefinition = "BOOLEAN default 'false'")
    private Boolean titleGenerated;

    @Column(columnDefinition = "BOOLEAN default 'false'")
    private Boolean pinned;

    @Column(name = "rag_enabled", columnDefinition = "BOOLEAN default 'false'")
    private Boolean ragEnabled;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(columnDefinition = "BOOLEAN default 'false'")
    private Boolean archived;
}
