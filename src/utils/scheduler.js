// -------------------------------------------------------------
// ESCALA SCHEDULER ENGINE - LOGICA DE CONFLITOS E AUTOESCALA
// -------------------------------------------------------------

import { getVolunteers, getServices, getAssignments } from "./storage";

/**
 * Retorna o mês e ano de uma data no formato "YYYY-MM"
 */
const getMonthYearKey = (dateString) => {
  if (!dateString) return "";
  return dateString.slice(0, 7); // Retorna "YYYY-MM"
};

/**
 * Valida todos os conflitos potenciais de um voluntário para um determinado culto
 * @returns {Object} { hasConflicts, doubleBooked, blackoutConflict, limitExceeded }
 */
export const checkConflicts = (volunteerId, serviceId) => {
  const volunteers = getVolunteers();
  const services = getServices();
  const assignments = getAssignments();

  const volunteer = volunteers.find(v => v.id === volunteerId);
  const currentService = services.find(s => s.id === serviceId);

  if (!volunteer || !currentService) {
    return { hasConflicts: false, doubleBooked: false, overlapConflict: false, blackoutConflict: false, limitExceeded: false };
  }

  const serviceDate = currentService.date; // YYYY-MM-DD
  const serviceMonthKey = getMonthYearKey(serviceDate);

  // 1. DUPLO AGENDAMENTO (Já está escalado em outra função neste mesmo culto)
  const isDoubleBooked = assignments.some(
    a => a.serviceId === serviceId && a.volunteerId === volunteerId
  );

  // 1B. CONFLITO DE OUTRO CULTO NO MESMO HORÁRIO (1 pessoa em 2 lugares diferentes)
  const otherScheduledAssignments = assignments.filter(
    a => a.volunteerId === volunteerId && a.serviceId !== serviceId
  );
  
  const hasTimeOverlapConflict = otherScheduledAssignments.some(a => {
    const otherService = services.find(s => s.id === a.serviceId);
    if (!otherService) return false;
    return otherService.date === currentService.date && otherService.time === currentService.time;
  });

  // 2. CONFLITO DE INDISPONIBILIDADE (Datas e Horários Bloqueados)
  const hasBlackoutConflict = volunteer.blackouts && volunteer.blackouts.some(blackout => {
    if (typeof blackout === "string") {
      // Bloqueio de dia inteiro legado
      return blackout === serviceDate;
    } else if (blackout && typeof blackout === "object") {
      // Bloqueio estruturado (Dia inteiro ou horário específico)
      if (blackout.date !== serviceDate) return false;
      if (blackout.allDay) return true; // Bloqueio total do dia
      
      // Bloqueio por intervalo de horas
      const serviceTime = currentService.time; // formato "HH:MM"
      if (!blackout.startTime || !blackout.endTime || !serviceTime) return false;
      
      return serviceTime >= blackout.startTime && serviceTime <= blackout.endTime;
    }
    return false;
  });

  // 3. LIMITE MENSAL EXCEDIDO
  // Filtra todos os cultos do mesmo mês
  const servicesInMonth = services.filter(s => getMonthYearKey(s.date) === serviceMonthKey);
  const serviceIdsInMonth = servicesInMonth.map(s => s.id);
  
  // Conta em quantos cultos deste mês o voluntário está escalado
  const volunteerAssignmentsInMonth = assignments.filter(
    a => a.volunteerId === volunteerId && serviceIdsInMonth.includes(a.serviceId)
  );
  
  const isLimitExceeded = volunteerAssignmentsInMonth.length >= (volunteer.maxMonthlyServices || 2);

  return {
    hasConflicts: isDoubleBooked || hasTimeOverlapConflict || hasBlackoutConflict || isLimitExceeded,
    doubleBooked: isDoubleBooked,
    overlapConflict: hasTimeOverlapConflict,
    blackoutConflict: hasBlackoutConflict,
    limitExceeded: isLimitExceeded,
    currentCount: volunteerAssignmentsInMonth.length,
    maxCount: volunteer.maxMonthlyServices || 2
  };
};

/**
 * Retorna a lista de voluntários recomendados para uma função específica, ordenados por prioridade
 */
export const getRecommendedVolunteers = (serviceId, ministryId, roleId) => {
  const volunteers = getVolunteers();
  const assignments = getAssignments();
  const services = getServices();
  
  const currentService = services.find(s => s.id === serviceId);
  if (!currentService) return [];

  // 1. Filtrar quem possui a habilidade correspondente
  const qualifiedVolunteers = volunteers.filter(v => 
    v.skills.some(s => s.ministryId === ministryId && s.roleId === roleId)
  );

  // 2. Calcular dados de histórico e conflito para cada um
  const volunteersWithScores = qualifiedVolunteers.map(volunteer => {
    const conflicts = checkConflicts(volunteer.id, serviceId);
    
    // Calcular quando foi a última vez que serviu (histórico de escalas)
    // Para simplificar, contamos o total de agendamentos no sistema para balanceamento de carga
    const totalAssignments = assignments.filter(a => a.volunteerId === volunteer.id).length;
    
    // Agendamentos no mês atual
    const serviceMonthKey = getMonthYearKey(currentService.date);
    const servicesInMonth = services.filter(s => getMonthYearKey(s.date) === serviceMonthKey);
    const serviceIdsInMonth = servicesInMonth.map(s => s.id);
    const monthlyAssignments = assignments.filter(
      a => a.volunteerId === volunteer.id && serviceIdsInMonth.includes(a.serviceId)
    ).length;

    // Pontuação de prioridade (Menor pontuação = Recomendado primeiro)
    let score = 0;
    
    // Penalidades severas
    if (conflicts.blackoutConflict) score += 1000; // Crítico: Indisponibilidade declarada
    if (conflicts.doubleBooked) score += 500;       // Crítico: Já está escalado neste culto
    if (conflicts.overlapConflict) score += 500;    // Crítico: Já está escalado em outro local no mesmo horário

    // Penalidade moderada
    if (conflicts.limitExceeded) score += 100;     // Ultrapassou limite preferido

    // Balanceamento de carga: priorizar quem serviu menos no mês e no total
    score += (monthlyAssignments * 10);
    score += totalAssignments;

    return {
      volunteer,
      conflicts,
      monthlyAssignments,
      totalAssignments,
      score
    };
  });

  // Ordena por pontuação (menor pontuação = melhor sugestão)
  return volunteersWithScores.sort((a, b) => a.score - b.score);
};

/**
 * MOTOR DE AUTOESCALA DE 1-CLIQUE
 * Preenche de forma inteligente os cargos ainda vazios em um culto específico
 */
export const runAutoScaleForService = (serviceId) => {
  const services = getServices();
  const currentService = services.find(s => s.id === serviceId);
  if (!currentService) return { success: false, message: "Culto não encontrado" };

  const currentAssignments = getAssignments();
  
  // Lista de cargos necessários neste culto
  const requiredRoles = currentService.requiredRoles || [];
  
  // Atribuições que já existem para este culto
  const serviceAssignments = currentAssignments.filter(a => a.serviceId === serviceId);
  
  let newAssignmentsCount = 0;
  const updatedAssignments = [...currentAssignments];

  // Loop em cada cargo necessário
  for (const roleReq of requiredRoles) {
    // Checar se este cargo já está preenchido
    const isFilled = serviceAssignments.some(
      a => a.ministryId === roleReq.ministryId && a.roleId === roleReq.roleId
    );
    
    if (isFilled) continue; // Pula se já estiver escalado alguém
    
    // Encontrar voluntários recomendados para este cargo
    // A função getRecommendedVolunteers lê de storage. Como atualizamos localmente a lista,
    // precisamos simular o check de conflitos atualizado na hora para evitar duplo agendamento!
    const recommendations = getRecommendedVolunteers(serviceId, roleReq.ministryId, roleReq.roleId);
    
    // Filtrar candidatos disponíveis (excluir quem já escalamos nesta mesma iteração!)
    const availableCandidate = recommendations.find(rec => {
      // Checar se o voluntário já foi escalado na lista atualizada para este mesmo culto
      const alreadyScheduledInThisRun = updatedAssignments.some(
        a => a.serviceId === serviceId && a.volunteerId === rec.volunteer.id
      );
      
      // Exclui conflitos críticos na autoescala (Duplo agendamento, Ausência e Conflito de Horário)
      const hasOverlap = updatedAssignments.some(a => {
        if (a.volunteerId !== rec.volunteer.id) return false;
        const otherService = services.find(s => s.id === a.serviceId);
        if (!otherService) return false;
        return otherService.date === currentService.date && otherService.time === currentService.time;
      });

      return !alreadyScheduledInThisRun && !hasOverlap && !rec.conflicts.blackoutConflict;
    });

    if (availableCandidate) {
      updatedAssignments.push({
        id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        serviceId: serviceId,
        ministryId: roleReq.ministryId,
        roleId: roleReq.roleId,
        volunteerId: availableCandidate.volunteer.id,
        status: "pending" // Novas escalas da autoescala iniciam pendentes de confirmação
      });
      newAssignmentsCount++;
    }
  }

  return {
    success: true,
    newAssignments: updatedAssignments,
    count: newAssignmentsCount
  };
};
