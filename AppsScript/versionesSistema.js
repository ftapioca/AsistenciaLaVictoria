function versionSistema() {
  return responderJSON({
    sistema: "RegistroAsistencia",
    version: "2.0.0",
    fecha: new Date()
  });
}