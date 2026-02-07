# Guía para Agentes de IA y Desarrolladores (AGENTS.md)

Quiero apuntar en este documento los prompts que poco a poco voy viendo que tengo que repetir en este proyecto para que los tenga en consideracion la IA, docs, test, etc...

## 1. Arquitectura y Principios

Revisa los endpoints si se ha creado una nueva entidad de domino
Revisa si para esta nueva feature hemos creado los test necesarios, se encuentran en la carpeta test
Revisa la documentación que esta en la carpeta docs para evaluar si los cambios de la feaute estan reflejados en los documentos
Revisa y recrea en el fichero de local-seed que se encuentar en infraestructure/persistence/prisma con los nuevos datos de la feature si fuese necesario

## 2. CI

Cuando se pida hacer una pull request hay que comparar la rama de develop con la rama actual y sus cambios, quiero que ese texto siempre sea en formato md para poder pegarlo en github, quiero que tengas en consideración que los ficheros excluidos en github que se puede ver en .gitignore no los añadas en los comentarios de la PR. No añadas a la documentacion el fichero docs/001-myfintonic_features.md.

## 3. ARS
