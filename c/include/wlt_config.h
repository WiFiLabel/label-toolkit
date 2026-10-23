#ifndef WLT_CONFIG_H
#define WLT_CONFIG_H

#if defined(__has_include)
#  if __has_include("sdkconfig.h")
#    include "sdkconfig.h"
#  endif
#endif

#ifndef WLT_WITH_DOCS
#  if defined(CONFIG_WLT_WITH_DOCS)
#    define WLT_WITH_DOCS CONFIG_WLT_WITH_DOCS
#  else
#    define WLT_WITH_DOCS 0
#  endif
#endif

#endif
