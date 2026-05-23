// -------------------------------------------------------------
// ESCALA SCHEDULER ENGINE - LOGICA DE CONFLITOS E AUTOESCALA
// Suporta 3 modos: Padrão, Emergencial e Automático
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
 * Valida todos os conflitos potenciais de um voluntário para um determinado culto.
 * O parâmetro `escalationMode` controla a severidade da validação:
 *   - "padrao"       → bloqueios de data e limite são impeditivos
 *   - "emergencial"  → bloqueios e limite são APENAS informativos (não bloqueiam)
 * Duplo agendamento (mesma pessoa 2x no mesmo evento) e overlap de horário
 * são SEMPRE impeditivos, independentemente do modo.
 */
export const checkConflicts = (volunteerId, serviceId, escalationMode = "padrao") => {
  const volunteers = getVolunteers();
  const services = getServices();
  const assignments = getAssignments();

  const volunteer = volunteers.find(v => v.id === volunteerId);
  const currentService = services.find(s => s.id === serviceId);

  if (!volunteer || !currentService) {
    return { hasConflicts: false, doubleBooked: false, overlapConflict: false, blackoutConflict: false, limitExceeded: false, isEmergency: false };
  }

  const isEmergency = escalationMode === "emergencial";
  const serviceDate = currentService.date; // YYYY-MM-DD
  const serviceMonthKey = getMonthYearKey(serviceDate);

  // 1. DUPLO AGENDAMENTO (Já está escalado em outra função neste mesmo culto)
  // SEMPRE impeditivo - nunca faz sentido a mesma pessoa 2x no mesmo evento
  const isDoubleBooked = assignments.some(
    a => a.serviceId === serviceId && a.volunteerId === volunteerId
  );

  // 1B. CONFLITO DE OUTRO CULTO NO MESMO HORÁRIO (1 pessoa em 2 lugares diferentes)
  // SEMPRE impeditivo - fisicamente impossível
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
      return blackout === serviceDate;
    } else if (blackout && typeof blackout === "object") {
      if (blackout.date !== serviceDate) return false;
      if (blackout.allDay) return true;
      const serviceTime = currentService.time;
      if (!blackout.startTime || !blackout.endTime || !serviceTime) return false;
      return serviceTime >= blackout.startTime && serviceTime <= blackout.endTime;
    }
    return false;
  });

  // 3. LIMITE MENSAL EXCEDIDO
  const servicesInMonth = services.filter(s => getMonthYearKey(s.date) === serviceMonthKey);
  const serviceIdsInMonth = servicesInMonth.map(s => s.id);
  const volunteerAssignmentsInMonth = assignments.filter(
    a => a.volunteerId === volunteerId && serviceIdsInMonth.includes(a.serviceId)
  );
  const isLimitExceeded = volunteerAssignmentsInMonth.length >= (volunteer.maxMonthlyServices || 2);

  // No modo EMERGENCIAL: blackout e limite NÃO bloqueiam, só avisam
  // Duplo agendamento e overlap são SEMPRE bloqueantes
  const hardBlock = isDoubleBooked || hasTimeOverlapConflict;
  const softBlock = hasBlackoutConflict || isLimitExceeded;

  return {
    hasConflicts: isEmergency ? hardBlock : (hardBlock || softBlock),
    doubleBooked: isDoubleBooked,
    overlapConflict: hasTimeOverlapConflict,
    blackoutConflict: hasBlackoutConflict,
    limitExceeded: isLimitExceeded,
    isEmergency,
    // Flag auxiliar: conflitos "suaves" que existem mas são bypassáveis em emergência
    hasSoftWarnings: softBlock,
    currentCount: volunteerAssignmentsInMonth.length,
    maxCount: volunteer.maxMonthlyServices || 2
  };
};

/**
 * Retorna a lista de voluntários recomendados para uma função específica, ordenados por prioridade
 * Aceita o modo de escalação para ajustar a severidade dos conflitos
 */
export const getRecommendedVolunteers = (serviceId, ministryId, roleId, escalationMode = "padrao") => {
  const volunteers = getVolunteers();
  const assignments = getAssignments();
  const services = getServices();
  
  const currentService = services.find(s => s.id === serviceId);
  if (!currentService) return [];

  const isEmergency = escalationMode === "emergencial";

  // 1. Filtrar quem possui a habilidade correspondente
  const qualifiedVolunteers = volunteers.filter(v => 
    v.skills.some(s => s.ministryId === ministryId && s.roleId === roleId)
  );

  // 2. Calcular dados de histórico e conflito para cada um
  const volunteersWithScores = qualifiedVolunteers.map(volunteer => {
    const conflicts = checkConflicts(volunteer.id, serviceId, escalationMode);
    
    const totalAssignments = assignments.filter(a => a.volunteerId === volunteer.id).length;
    
    const serviceMonthKey = getMonthYearKey(currentService.date);
    const servicesInMonth = services.filter(s => getMonthYearKey(s.date) === serviceMonthKey);
    const serviceIdsInMonth = servicesInMonth.map(s => s.id);
    const monthlyAssignments = assignments.filter(
      a => a.volunteerId === volunteer.id && serviceIdsInMonth.includes(a.serviceId)
    ).length;

    // Pontuação de prioridade (Menor pontuação = Recomendado primeiro)
    let score = 0;
    
    // Penalidades SEMPRE aplicadas (fisicamente impossível)
    if (conflicts.doubleBooked) score += 500;
    if (conflicts.overlapConflict) score += 500;

    if (isEmergency) {
      // Em emergência: blackout e limite são penalidades moderadas (não bloqueiam)
      if (conflicts.blackoutConflict) score += 50;
      if (conflicts.limitExceeded) score += 30;
    } else {
      // Em modo padrão: blackout é crítico, limite é moderado
      if (conflicts.blackoutConflict) score += 1000;
      if (conflicts.limitExceeded) score += 100;
    }

    // Balanceamento de carga
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

  return volunteersWithScores.sort((a, b) => a.score - b.score);
};

/**
 * MOTOR DE AUTOESCALA DE 1-CLIQUE
 * Preenche de forma inteligente os cargos ainda vazios em um culto específico.
 * Respeita o modo de escalação definido no culto.
 */
export const runAutoScaleForService = (serviceId, escalationModeOverride = null) => {
  const services = getServices();
  const currentService = services.find(s => s.id === serviceId);
  if (!currentService) return { success: false, message: "Culto não encontrado" };

  // Usa o modo definido no culto, ou o override passado como parâmetro
  const escalationMode = escalationModeOverride || currentService.escalationMode || "padrao";
  const isEmergency = escalationMode === "emergencial";

  const currentAssignments = getAssignments();
  
  const requiredRoles = currentService.requiredRoles || [];
  const serviceAssignments = currentAssignments.filter(a => a.serviceId === serviceId);
  
  let newAssignmentsCount = 0;
  const updatedAssignments = [...currentAssignments];

  for (const roleReq of requiredRoles) {
    const isFilled = serviceAssignments.some(
      a => a.ministryId === roleReq.ministryId && a.roleId === roleReq.roleId
    );
    
    if (isFilled) continue;
    
    const recommendations = getRecommendedVolunteers(serviceId, roleReq.ministryId, roleReq.roleId, escalationMode);
    
    const availableCandidate = recommendations.find(rec => {
      // Sempre impede duplo agendamento no mesmo culto
      const alreadyScheduledInThisRun = updatedAssignments.some(
        a => a.serviceId === serviceId && a.volunteerId === rec.volunteer.id
      );
      
      // Sempre impede overlap de horário (fisicamente impossível)
      const hasOverlap = updatedAssignments.some(a => {
        if (a.volunteerId !== rec.volunteer.id) return false;
        const otherService = services.find(s => s.id === a.serviceId);
        if (!otherService) return false;
        return otherService.date === currentService.date && otherService.time === currentService.time;
      });

      if (alreadyScheduledInThisRun || hasOverlap) return false;

      // Em modo emergencial: ignora blackout e limite (chama todos)
      // Em modo padrão: respeita blackout estritamente
      if (!isEmergency && rec.conflicts.blackoutConflict) return false;

      return true;
    });

    if (availableCandidate) {
      updatedAssignments.push({
        id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        serviceId: serviceId,
        ministryId: roleReq.ministryId,
        roleId: roleReq.roleId,
        volunteerId: availableCandidate.volunteer.id,
        status: "pending"
      });
      newAssignmentsCount++;
    }
  }

  return {
    success: true,
    newAssignments: updatedAssignments,
    count: newAssignmentsCount,
    mode: escalationMode
  };
};
