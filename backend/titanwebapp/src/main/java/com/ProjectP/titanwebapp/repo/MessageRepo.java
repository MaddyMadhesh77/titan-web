package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {
    List<Message> findAllByOrderByTimestampDesc();
    List<Message> findBySenderUsernameOrderByTimestampDesc(String senderUsername);
}