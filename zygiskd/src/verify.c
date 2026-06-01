#include "verify.h"
#include "utils.h"
#include <stdio.h>
#include <string.h>
#include <linux/limits.h>

bool verify_module_so(const char *module_dir, const char *name, const char *arch_str) {
  char sig_path[PATH_MAX];
  snprintf(sig_path, sizeof(sig_path), "%s/%s/machikado.%s", module_dir, name, arch_str);

  FILE *f = fopen(sig_path, "rb");
  if (!f) {
    LOGW("[verify] No machikado.%s for '%s' — unsigned, allowing", arch_str, name);
    return true;
  }

  if (fseek(f, 0, SEEK_END) != 0) {
    fclose(f);
    LOGW("[verify] fseek failed for '%s' signature, allowing", name);
    return true;
  }

  long size = ftell(f);
  fclose(f);

  if (size < 0) {
    LOGW("[verify] ftell failed for '%s' signature, allowing", name);
    return true;
  }

  if (size == 0) {
    LOGW("[verify] Empty machikado.%s for '%s' — unsigned build, allowing", arch_str, name);
    return true;
  }

  LOGI("[verify] Signature present for '%s' (%ld bytes) — full crypto TODO", name, size);
  return true;
}
