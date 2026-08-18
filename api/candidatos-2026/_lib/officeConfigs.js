export const governorConfig = { logName: 'governadores', officeCode: () => 3, officeLabel: () => 'Governador' }
export const senatorConfig = { logName: 'senadores', officeCode: () => 5, officeLabel: () => 'Senador' }
export const federalDeputyConfig = { logName: 'deputados-federais', officeCode: () => 6, officeLabel: () => 'Deputado Federal' }
export const stateDeputyConfig = { logName: 'deputados-estaduais', officeCode: (uf) => uf === 'DF' ? 8 : 7,
  officeLabel: (uf) => uf === 'DF' ? 'Deputado Distrital' : 'Deputado Estadual' }
