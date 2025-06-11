package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.Report;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Repository
@Component
public interface ReportRepo extends JpaRepository<Report, Long> {
}
