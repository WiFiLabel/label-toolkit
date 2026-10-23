cmake_minimum_required(VERSION 3.16)

# The component directory is c/, so the in-tree name is c.
# A git dependency named label_toolkit with path: c is checked out as
# managed_components/label_toolkit and is required under that name.
set(EXTRA_COMPONENT_DIRS "${CMAKE_CURRENT_LIST_DIR}/../..")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(wlt_basic)
