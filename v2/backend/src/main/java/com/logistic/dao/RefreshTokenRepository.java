package com.logistic.dao;

import com.logistic.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByUserId(Long userId);

    void deleteByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :cutoff")
    void deleteExpiredBefore(Instant cutoff);
}
