cmake_minimum_required(VERSION 3.16)

if(ESP_PLATFORM)
  idf_component_register(
    SRCS "src/wlt_spec.c" "src/wlt_zpl.c" "src/wlt_status.c"
    INCLUDE_DIRS "include"
  )
  return()
endif()

project(label_toolkit_host C)
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_library(label_toolkit STATIC src/wlt_spec.c src/wlt_zpl.c src/wlt_status.c)
target_include_directories(label_toolkit PUBLIC include)
target_compile_options(label_toolkit PRIVATE -Wall -Wextra -Wpedantic)
enable_testing()
add_subdirectory(test)
