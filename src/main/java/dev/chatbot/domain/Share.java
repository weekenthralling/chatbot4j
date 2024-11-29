package dev.chatbot.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * @author zhoumo
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "share", indexes = {
        @Index(name = "idx_share_owner", columnList = "owner")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Share {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;  // UUID primary key

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String owner;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false, columnDefinition = "JSONB")
    private String snapshotRef;  // This can be a JSON string or use a separate entity

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
