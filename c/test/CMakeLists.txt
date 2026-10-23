add_executable(wlt_test test_main.c json_min.c)
target_link_libraries(wlt_test PRIVATE label_toolkit)
target_compile_options(wlt_test PRIVATE -Wall -Wextra -Wpedantic)
target_compile_definitions(
  wlt_test PRIVATE "WLT_VECTORS_DIR=\"${CMAKE_SOURCE_DIR}/../test-vectors\""
)
add_test(NAME wlt_vectors COMMAND wlt_test)
